import State, {
  cloneStateShallow,
} from '@lblod/ember-rdfa-editor/core/state/index';
import ModelRange, {
  ModelRangeFactory,
  RangeFactory,
} from '@lblod/ember-rdfa-editor/core/model/model-range';
import { Mark, MarkSet, MarkSpec } from '../model/marks/mark';
import ModelNode from '../model/nodes/model-node';
import ModelSelection from '../model/model-selection';
import InsertTextOperation from '../model/operations/insert-text-operation';
import RangeMapper, { LeftOrRight } from '../model/range-mapper';
import { HtmlReaderContext, readHtml } from '../model/readers/html-reader';
import SelectionReader from '../model/readers/selection-reader';
import { getWindowSelection } from '../../utils/dom-helpers';
import { NotImplementedError } from '../../utils/errors';
import { View } from '../view';
import InsertOperation from '@lblod/ember-rdfa-editor/core/model/operations/insert-operation';
import ModelElement from '../model/nodes/model-element';
import MarkOperation from '../model/operations/mark-operation';
import ModelPosition from '../model/model-position';
import SplitOperation from '../model/operations/split-operation';
import MoveOperation from '../model/operations/move-operation';
import { EditorStore } from '../../utils/datastore/datastore';
import { AttributeSpec } from '../../utils/render-spec';
import RemoveOperation from '../model/operations/remove-operation';
import {
  CommandExecutor,
  commandMapToCommandExecutor,
} from '../../commands/command-manager';
import { CommandName, Commands } from '@lblod/ember-rdfa-editor';
import { isOperationStep, Step } from './steps/step';
import SelectionStep from './steps/selection-step';
import OperationStep from './steps/operation-step';
import ConfigStep from './steps/config-step';
import { createLogger } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Operation from '@lblod/ember-rdfa-editor/core/model/operations/operation';
import MarksManager from '../model/marks/marks-manager';
import { ViewController } from '../controllers/view-controller';
import { ResolvedPluginConfig } from '@lblod/ember-rdfa-editor/components/rdfa/rdfa-editor';
import PluginStep from './steps/plugin-step';
import Controller, { WidgetSpec } from '../controllers/controller';
import { InlineComponentSpec } from '../model/inline-components/model-inline-component';
import MapUtils from '@lblod/ember-rdfa-editor/utils/map-utils';

interface TextInsertion {
  range: ModelRange;
  text: string;
  marks?: MarkSet;
}

export type TransactionStepListener = (
  transaction: Transaction,
  steps: Step[]
) => void;

export type TransactionDispatchListener = (transaction: Transaction) => void;
/**
 * This is the main way to produce a new state based on an initial state.
 * As such, this class implements all editing primitives available.
 * */
export default class Transaction {
  initialState: State;
  private _workingCopy: State;
  private _steps: Step[];
  private _shouldFocus: boolean;
  rangeMapper: RangeMapper;
  // we clone the nodes, so rdfa is invalid even if nothing happens to them
  // TODO: improve this
  rdfInvalid = false;
  marksInvalid = false;
  logger = createLogger('transaction');
  private _commandCache?: CommandExecutor;

  constructor(state: State) {
    this.initialState = state;
    /*
     * Current implementation is heavily influenced by time and complexity constraints.
     * By simply copying the state and then mutating the copy, most logic could be ported over verbatim.
     * However this simplicity comes at a cost of awkward workarounds in certain situations,
     * so is an immediate target for improvement later.
     */
    this._workingCopy = cloneStateShallow(state);
    this._steps = [];
    this.rangeMapper = new RangeMapper();
    this._shouldFocus = false;
  }

  get currentDocument() {
    return this._workingCopy.document;
  }

  get workingCopy() {
    return this._workingCopy;
  }

  get currentSelection() {
    return this._workingCopy.selection;
  }

  get rangeFactory(): RangeFactory {
    return new ModelRangeFactory(this.currentDocument);
  }

  get size() {
    return this._steps.length;
  }

  get steps() {
    return this._steps;
  }

  get shouldFocus(): boolean {
    return this._shouldFocus;
  }

  deepClone() {
    if (this._workingCopy.document === this.initialState.document) {
      this.logger('Performing deepclone');
      const documentClone = this.initialState.document.clone();
      this._workingCopy.document = documentClone;
      this._workingCopy.selection =
        this.initialState.selection.clone(documentClone);
      this._workingCopy.inlineComponentsRegistry =
        this.initialState.inlineComponentsRegistry.clone(
          this.initialState.document,
          documentClone
        );
      this.rdfInvalid = true;
      this.marksInvalid = true;
    }
  }

  getCurrentDataStore() {
    if (this.rdfInvalid) {
      this.logger('Recalculating datastore');
      this._workingCopy.datastore = EditorStore.fromParse({
        modelRoot: this._workingCopy.document,
        baseIRI: this._workingCopy.baseIRI,
        pathFromDomRoot: this._workingCopy.pathFromDomRoot,
      });
      this.rdfInvalid = false;
    }
    return this._workingCopy.datastore;
  }

  getMarksManager() {
    if (this.marksInvalid) {
      MarksManager.fromDocument(this._workingCopy.document);
      this._workingCopy.marksManager = MarksManager.fromDocument(
        this._workingCopy.document
      );
      this.marksInvalid = false;
    }
    return this._workingCopy.marksManager;
  }

  async setPlugins(configs: ResolvedPluginConfig[], view: View): Promise<void> {
    for (const plugin of this.workingCopy.plugins) {
      if (plugin.willDestroy) {
        await plugin.willDestroy(this);
      }
    }
    const step = new PluginStep(this.workingCopy, configs, view);
    this.commitStep(step);
    for (const config of configs) {
      const plugin = config.instance;
      const controller = new ViewController(plugin.name, view);
      await plugin.initialize(this, controller, config.options);
    }
  }

  setBaseIRI(iri: string): void {
    this._workingCopy.baseIRI = iri;
  }

  setPathFromDomRoot(path: Node[]) {
    this._workingCopy.pathFromDomRoot = path;
  }

  addTransactionStepListener(listener: TransactionStepListener) {
    this._workingCopy.transactionStepListeners.add(listener);
  }

  removeTransactionStepListener(listener: TransactionStepListener) {
    this._workingCopy.transactionStepListeners.delete(listener);
  }

  addTransactionDispatchListener(listener: TransactionDispatchListener) {
    this._workingCopy.transactionDispatchListeners.add(listener);
  }

  removeTransactionDispatchListener(listener: TransactionDispatchListener) {
    this._workingCopy.transactionDispatchListeners.delete(listener);
  }

  addMark(range: ModelRange, spec: MarkSpec, attributes: AttributeSpec) {
    this.deepClone();
    const op = new MarkOperation(
      undefined,
      this.cloneRange(range),
      spec,
      attributes,
      'add'
    );
    this.createSnapshot();
    return this.executeOperation(op);
  }

  /**
   * Build the new state from the viewstate (aka the DOM)
   * Typically done as (one of) the first transaction upon loading the editor.
   * */
  readFromView(view: View): void {
    this.deepClone();
    const context = new HtmlReaderContext({
      marksRegistry: this._workingCopy.marksRegistry,
      inlineComponentsRegistry: this._workingCopy.inlineComponentsRegistry,
    });
    const parsedNodes = readHtml(view.domRoot, context);
    if (parsedNodes.length !== 1) {
      throw new NotImplementedError();
    }
    const newVdom = parsedNodes[0];
    if (!ModelNode.isModelElement(newVdom)) {
      throw new NotImplementedError();
    }
    const selectionReader = new SelectionReader();
    const newSelection = selectionReader.read(
      this._workingCopy,
      view.domRoot,
      getWindowSelection()
    );

    this._workingCopy.document = newVdom;
    this._workingCopy.selection = newSelection;
    this.createSnapshot();
  }

  setSelectionFromView(view: View): void {
    const selectionReader = new SelectionReader();
    const newSelection = selectionReader.read(
      this._workingCopy,
      view.domRoot,
      getWindowSelection()
    );

    this.commitStep(new SelectionStep(this.workingCopy, newSelection));
  }

  /**
   * Produce the new state from the initial state.
   * It is left to implementation details what this means,
   * providing flexibility to implement batch-style editing or otherwise.
   * */
  apply(): State {
    if (
      this.initialState.baseIRI !== this._workingCopy.baseIRI ||
      this.initialState.pathFromDomRoot !== this._workingCopy.pathFromDomRoot ||
      this._workingCopy.document !== this.initialState.document
    ) {
      this.getCurrentDataStore();
      this.getMarksManager();
    }
    return this._workingCopy;
  }

  insertText({ range, text, marks }: TextInsertion): ModelRange {
    this.deepClone();
    const operation = new InsertTextOperation(
      undefined,
      this.cloneRange(range),
      text,
      marks || new MarkSet()
    );
    this.createSnapshot();
    return this.executeOperation(operation);
  }

  insertNodes(range: ModelRange, ...nodes: ModelNode[]): ModelRange {
    this.deepClone();
    const op = new InsertOperation(undefined, this.cloneRange(range), ...nodes);
    this.createSnapshot();
    return this.executeOperation(op);
  }

  /**
   * Sets a new selection and returns whether the new selection differs from the old one
   * */
  setSelection(selection: ModelSelection) {
    const clone = this.cloneSelection(selection);
    const changed = !clone.sameAs(this._workingCopy.selection);
    if (changed) {
      this.commitStep(new SelectionStep(this.workingCopy, clone));
    }
    return changed;
  }

  setProperty(element: ModelElement, key: string, value: string): ModelElement {
    this.deepClone();
    const node = this.inWorkingCopy(element);

    if (!node) throw new Error('no element in range');
    node.setAttribute(key, value);
    return node;
    // const oldNode = element;
    // if (!oldNode) throw new Error('no element in range');
    // const newNode = oldNode.clone();
    // newNode.setAttribute(key, value);
    // const oldNodeRange = ModelRange.fromAroundNode(oldNode);
    // const op = new InsertOperation(
    //   undefined,
    //   this.cloneRange(oldNodeRange),
    //   newNode
    // );
    // this.executeOperation(op);
    // return newNode;
  }

  setConfig(key: string, value: string | null): void {
    this.commitStep(new ConfigStep(this.workingCopy, key, value));
  }

  removeProperty(element: ModelNode, key: string): ModelNode {
    this.deepClone();
    const node = this.inWorkingCopy(element);

    if (!node) throw new Error('no element in range');
    node.removeAttribute(key);
    return node;
    // const oldNode = element;
    // if (!oldNode) throw new Error('no element in range');
    // const newNode = oldNode.clone();
    // newNode.removeAttribute(key);
    // const oldNodeRange = ModelRange.fromAroundNode(oldNode);
    // const op = new InsertOperation(
    //   undefined,
    //   this.cloneRange(oldNodeRange),
    //   newNode
    // );
    // this.executeOperation(op);
    // return newNode;
  }

  removeNodes(range: ModelRange, ...nodes: ModelNode[]): ModelRange {
    this.deepClone();
    const clonedRange = this.cloneRange(range);
    const op = new RemoveOperation(undefined, clonedRange, ...nodes);
    return this.executeOperation(op);
  }

  private executeOperation(op: Operation): ModelRange {
    const step = new OperationStep(this.workingCopy, op);
    this.commitStep(step);
    return step.defaultRange;
  }

  private commitStep(step: Step): void {
    this._steps.push(step);
    this._workingCopy = step.resultState;
    if (isOperationStep(step)) {
      this.rdfInvalid = true;
      this.marksInvalid = true;
    }
  }

  selectRange(range: ModelRange): void {
    const clone = this.cloneSelection(this.workingCopy.selection);
    clone.selectRange(range, clone.isRightToLeft);
    clone.isRightToLeft = this.workingCopy.selection.isRightToLeft;
    this.commitStep(new SelectionStep(this.workingCopy, clone));
  }

  addMarkToSelection(mark: Mark) {
    const clone = this.cloneSelection(this.workingCopy.selection);
    clone.activeMarks.add(mark);
    this.commitStep(new SelectionStep(this.workingCopy, clone));
    this.createSnapshot();
  }

  moveToPosition(
    rangeToMove: ModelRange,
    targetPosition: ModelPosition
  ): ModelRange {
    this.deepClone();
    const rangeClone = this.cloneRange(rangeToMove);
    const posClone = this.clonePos(targetPosition);
    const op = new MoveOperation(undefined, rangeClone, posClone);
    return this.executeOperation(op);
  }

  removeMarkFromSelection(markname: string) {
    const clone = this.cloneSelection(this.workingCopy.selection);

    for (const mark of this._workingCopy.selection.activeMarks) {
      if (mark.name === markname) {
        clone.activeMarks.delete(mark);
      }
    }
    this.commitStep(new SelectionStep(this.workingCopy, clone));
    this.createSnapshot();
  }

  /**
   * Make a snapshot of the new state, meaning that it will be registered
   * in the history and can be recalled later.
   * */
  createSnapshot() {
    this._workingCopy.previousState = this.initialState;
    return this.initialState;
  }

  /**
   * Reset this transaction, discarding any changes made
   * */
  rollback(): State {
    this._workingCopy = this.initialState;
    return this._workingCopy;
  }

  /**
   * Reset only the document
   */
  rollbackDocument(): State {
    this.logger('Rolling back document');
    this._workingCopy.document = this.initialState.document;
    return this._workingCopy;
  }

  /**
   * Split the given range until start.parent === startLimit
   * and end.parent === endLimit
   * The resulting range fully contains the split-off elements
   * @param range
   * @param startLimit
   * @param endLimit
   * @param splitAtEnds
   */
  splitRangeUntilElements(
    range: ModelRange,
    startLimit: ModelElement,
    endLimit: ModelElement,
    splitAtEnds = false
  ) {
    this.deepClone();
    const clonedRange = this.cloneRange(range);
    const endPos = this.splitUntilElement(
      clonedRange.end,
      this.inWorkingCopy(endLimit),
      splitAtEnds
    );
    const afterEnd = endPos.nodeAfter();
    const startpos = this.splitUntilElement(
      clonedRange.start,
      this.inWorkingCopy(startLimit),
      splitAtEnds
    );

    if (afterEnd) {
      return new ModelRange(startpos, ModelPosition.fromBeforeNode(afterEnd));
    } else {
      return new ModelRange(
        startpos,
        ModelPosition.fromInElement(endPos.parent, endPos.parent.getMaxOffset())
      );
    }
  }

  splitUntilElement(
    position: ModelPosition,
    limitElement: ModelElement,
    splitAtEnds = false
  ): ModelPosition {
    this.deepClone();
    this.createSnapshot();
    return this.splitUntil(
      position,
      (element) => element === this.inWorkingCopy(limitElement),
      splitAtEnds
    );
  }

  splitUntil(
    position: ModelPosition,
    untilPredicate: (element: ModelElement) => boolean,
    splitAtEnds = false
  ): ModelPosition {
    this.deepClone();
    let pos = position;

    // Execute split at least once
    if (pos.parent === pos.root || untilPredicate(pos.parent)) {
      return this.executeSplit(pos, splitAtEnds, false, false);
    }

    while (pos.parent !== pos.root && !untilPredicate(pos.parent)) {
      pos = this.executeSplit(pos, splitAtEnds, true);
    }

    this.createSnapshot();
    return pos;
  }

  private executeSplit(
    position: ModelPosition,
    splitAtEnds = false,
    splitParent = true,
    wrapAround = true
  ) {
    if (!splitAtEnds) {
      if (position.parentOffset === 0) {
        return !wrapAround || position.parent === position.root
          ? position
          : ModelPosition.fromBeforeNode(position.parent);
      } else if (position.parentOffset === position.parent.getMaxOffset()) {
        return !wrapAround || position.parent === position.root
          ? position
          : ModelPosition.fromAfterNode(position.parent);
      }
    }

    this.createSnapshot();

    return this.executeSplitOperation(position, splitParent);
  }

  private executeSplitOperation(position: ModelPosition, splitParent = true) {
    const range = new ModelRange(position, position);
    const op = new SplitOperation(
      undefined,
      this.cloneRange(range),
      splitParent
    );
    this.createSnapshot();
    return this.executeOperation(op).start;
  }

  insertAtPosition(position: ModelPosition, ...nodes: ModelNode[]): ModelRange {
    this.deepClone();
    const posClone = this.clonePos(position);
    this.createSnapshot();
    return this.insertNodes(new ModelRange(posClone, posClone), ...nodes);
  }

  deleteNode(node: ModelNode): ModelRange {
    this.deepClone();
    const range = this.cloneRange(ModelRange.fromAroundNode(node));
    this.createSnapshot();
    return this.delete(range);
  }

  delete(range: ModelRange): ModelRange {
    this.deepClone();
    const op = new InsertOperation(undefined, this.cloneRange(range));
    this.createSnapshot();
    return this.executeOperation(op);
  }

  collapseSelection(left = false) {
    const sel = this.cloneSelection(this.currentSelection);
    sel.lastRange?.collapse(left);
    this.setSelection(sel);
  }

  /**
   * Clone a range and set its root in the new state.
   * This is currently public to provide a workaround for various editing implementations
   * which depended on stateful logic, but should eventually become private or dissapear
   * */
  cloneRange(range: ModelRange): ModelRange {
    if (range.root !== this._workingCopy.document) {
      return range.clone(this._workingCopy.document);
    } else {
      return range;
    }
  }

  /**
   * Position version of @link{cloneRange}
   * */
  clonePos(pos: ModelPosition): ModelPosition {
    return pos.clone(this._workingCopy.document);
  }

  /**
   * Selection version of @link{cloneRange}
   * */
  cloneSelection(selection: ModelSelection): ModelSelection {
    return selection.clone(this._workingCopy.document);
  }

  collapseIn(node: ModelNode, offset = 0) {
    this._workingCopy.selection.clearRanges();
    this._workingCopy.selection.addRange(
      this.cloneRange(ModelRange.fromInNode(node, offset, offset))
    );
  }

  /**
   * Replaces the element by its children. Returns a range containing the unwrapped children
   * TODO while it works, this interface doesn't work intuitively with the immutable style
   * @param element
   * @param ensureBlock ensure the unwrapped children are rendered as a block by surrounding them with br elements when necessary
   */
  unwrap(element: ModelElement, ensureBlock = false): ModelRange {
    this.deepClone();
    const srcRange = ModelRange.fromInElement(
      element,
      0,
      element.getMaxOffset()
    );
    const target = ModelPosition.fromBeforeNode(element);
    const op = new MoveOperation(
      undefined,
      this.cloneRange(srcRange),
      this.clonePos(target)
    );
    const resultRange = this.executeOperation(op);
    this.deleteNode(resultRange.end.nodeAfter()!);

    if (ensureBlock) {
      const nodeBeforeStart = resultRange.start.nodeBefore();
      const nodeAfterStart = resultRange.start.nodeAfter();
      const nodeBeforeEnd = resultRange.end.nodeBefore();
      const nodeAfterEnd = resultRange.end.nodeAfter();

      if (
        nodeBeforeEnd &&
        nodeAfterEnd &&
        nodeBeforeEnd !== nodeAfterEnd &&
        !nodeBeforeEnd.isBlock &&
        !nodeAfterEnd.isBlock
      ) {
        this.insertAtPosition(resultRange.end, new ModelElement('br'));
      }
      if (
        nodeBeforeStart &&
        nodeAfterStart &&
        nodeBeforeStart !== nodeAfterStart &&
        !nodeBeforeStart.isBlock &&
        !nodeAfterStart.isBlock
      ) {
        this.insertAtPosition(resultRange.start, new ModelElement('br'));
      }
    }

    this.createSnapshot();
    return resultRange;
  }

  replaceNode(oldNode: ModelNode, ...newNodes: ModelNode[]): void {
    this.insertNodes(ModelRange.fromAroundNode(oldNode), ...newNodes);
  }

  removeMark(range: ModelRange, spec: MarkSpec, attributes: AttributeSpec) {
    this.deepClone();
    const op = new MarkOperation(
      undefined,
      this.cloneRange(range),
      spec,
      attributes,
      'remove'
    );
    this.createSnapshot();
    return this.executeOperation(op);
  }

  registerCommand<N extends CommandName>(name: N, command: Commands[N]): void {
    this.workingCopy.commands[name] = command;
    this._commandCache = undefined;
  }

  registerWidget(spec: WidgetSpec, controller: Controller): void {
    MapUtils.setOrPush(this.workingCopy.widgetMap, spec.desiredLocation, {
      controller,
      ...spec,
    });
  }

  registerMark(spec: MarkSpec<AttributeSpec>): void {
    this.workingCopy.marksRegistry.registerMark(spec);
  }

  registerInlineComponent(component: InlineComponentSpec) {
    this.workingCopy.inlineComponentsRegistry.registerComponent(component);
  }

  get commands(): CommandExecutor {
    if (!this._commandCache) {
      this._commandCache = commandMapToCommandExecutor(
        this.workingCopy.commands,
        this
      );
    }
    return this._commandCache;
  }

  /* Restore a state from the history
   * @param steps Amount of steps to look back
   * */
  restoreSnapshot(steps: number) {
    let prev: State | null = this.initialState;
    let reverts = 0;
    while (prev && reverts < steps) {
      this._workingCopy = prev;
      prev = prev.previousState;
      reverts++;
    }
    if (prev) {
      this._workingCopy = prev;
    }
  }

  /**
   * Find the relative node in the workingcopy
   * TODO: this is a shortcut, should ultimately not be needed
   * */
  inWorkingCopy<N extends ModelNode>(node: N): N {
    if (node.root === this._workingCopy.document) {
      return node;
    }
    const pos = this.clonePos(ModelPosition.fromBeforeNode(node));
    return pos.nodeAfter()! as N;
  }

  mapSelection(
    selection: ModelSelection,
    bias: LeftOrRight = 'right'
  ): ModelSelection {
    const clone = this.cloneSelection(selection);
    for (const step of this.steps) {
      clone.ranges = clone.ranges.map((range) => step.mapRange(range, bias));
    }
    return clone;
  }

  mapInitialSelection(bias: LeftOrRight = 'right'): ModelSelection {
    return this.mapSelection(this.initialState.selection, bias);
  }

  mapInitialSelectionAndSet(bias: LeftOrRight = 'right'): void {
    const result = this.mapInitialSelection(bias);
    this.setSelection(result);
  }

  /**
   * Tell the view that it needs to focus the viewRoot after applying changes.
   * Mostly needed for things like toolbar buttons which steal the focus.
   */
  focus() {
    this._shouldFocus = true;
  }
}
