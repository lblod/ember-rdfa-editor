import State, { cloneState } from '@lblod/ember-rdfa-editor/core/state';
import ModelRange, {
  ModelRangeFactory,
  RangeFactory,
} from '@lblod/ember-rdfa-editor/model/model-range';
import { Mark, MarkSet, MarkSpec } from '../model/mark';
import ModelNode from '../model/model-node';
import ModelSelection from '../model/model-selection';
import InsertTextOperation from '../model/operations/insert-text-operation';
import Operation from '../model/operations/operation';
import RangeMapper from '../model/range-mapper';
import HtmlReader, { HtmlReaderContext } from '../model/readers/html-reader';
import SelectionReader from '../model/readers/selection-reader';
import { getWindowSelection } from '../utils/dom-helpers';
import { InitializedPlugin } from '../utils/editor-plugin';
import { NotImplementedError } from '../utils/errors';
import { View } from './view';
import InsertOperation from '@lblod/ember-rdfa-editor/model/operations/insert-operation';
import ModelElement from '../model/model-element';
import MarkOperation from '../model/operations/mark-operation';
import ModelPosition from '../model/model-position';
import SplitOperation from '../model/operations/split-operation';
import MoveOperation from '../model/operations/move-operation';
import { EditorStore } from '../model/util/datastore/datastore';
import { AttributeSpec } from '../model/util/render-spec';
import RemoveOperation from '../model/operations/remove-operation';
import SelectionOperation from '../model/operations/selection-operation';
import {
  CommandExecutor,
  commandMapToCommandExecutor,
} from '../commands/command-manager';
import { Commands } from '@lblod/ember-rdfa-editor';
import { CommandName } from '@lblod/ember-rdfa-editor';
interface TextInsertion {
  range: ModelRange;
  text: string;
  marks?: MarkSet;
}
export type TransactionListener = (
  transaction: Transaction,
  operations: Operation[]
) => void;

/**
 * This is the main way to produce a new state based on an initial state.
 * As such, this class implements all editing primitives available.
 * */
export default class Transaction {
  initialState: State;
  private _workingCopy: State;
  private _operations: Operation[];
  rangeMapper: RangeMapper;
  rdfInvalid = true;
  private _commandCache?: CommandExecutor;

  constructor(state: State) {
    this.initialState = state;
    /*
     * Current implementation is heavily influenced by time and complexity constraints.
     * By simply copying the state and then mutating the copy, most logic could be ported over verbatim.
     * However this simplicity comes at a cost of awkward workarounds in certain situations,
     * so is an immediate target for improvement later.
     */
    this._workingCopy = cloneState(state);
    this._operations = [];
    this.rangeMapper = new RangeMapper();
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
    return this._operations.length;
  }

  get operations() {
    return this._operations;
  }

  getCurrentDataStore() {
    if (this.rdfInvalid) {
      this._workingCopy.datastore = EditorStore.fromParse({
        modelRoot: this._workingCopy.document,
        baseIRI: this._workingCopy.baseIRI,
        pathFromDomRoot: this._workingCopy.pathFromDomRoot,
      });
      this.rdfInvalid = false;
    }
    return this._workingCopy.datastore;
  }

  setPlugins(plugins: InitializedPlugin[]): void {
    this._workingCopy.plugins = plugins;
  }
  setBaseIRI(iri: string): void {
    this._workingCopy.baseIRI = iri;
  }
  setPathFromDomRoot(path: Node[]) {
    this._workingCopy.pathFromDomRoot = path;
  }

  addListener(listener: TransactionListener) {
    this._workingCopy.transactionListeners.push(listener);
  }

  removeListener(listener: TransactionListener) {
    const index = this._workingCopy.transactionListeners.indexOf(listener);
    if (index !== -1) {
      this._workingCopy.transactionListeners.splice(index, 1);
    }
  }

  addMark(range: ModelRange, spec: MarkSpec, attributes: AttributeSpec) {
    const op = new MarkOperation(
      undefined,
      this.cloneRange(range),
      spec,
      attributes,
      'add'
    );
    this.createSnapshot();
    return this.executeOperation(op).defaultRange;
  }

  /**
   * Build the new state from the viewstate (aka the DOM)
   * Typically done as (one of) the first transaction upon loading the editor.
   * */
  readFromView(view: View): void {
    const htmlReader = new HtmlReader();
    const context = new HtmlReaderContext({
      marksRegistry: this._workingCopy.marksRegistry,
      inlineComponentsRegistry: this._workingCopy.inlineComponentsRegistry,
    });
    const parsedNodes = htmlReader.read(view.domRoot, context);
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

  /**
   * Produce the new state from the initial state.
   * It is left to implementation details what this means,
   * providing flexibility to implement batch-style editing or otherwise.
   * */
  apply(): State {
    if (
      this.initialState.baseIRI !== this._workingCopy.baseIRI ||
      this.initialState.pathFromDomRoot !== this._workingCopy.pathFromDomRoot ||
      this._workingCopy !== this.initialState
    ) {
      this.getCurrentDataStore();
    }
    return this._workingCopy;
  }

  insertText({ range, text, marks }: TextInsertion): ModelRange {
    const operation = new InsertTextOperation(
      undefined,
      this.cloneRange(range),
      text,
      marks || new MarkSet()
    );
    this.createSnapshot();
    return this.executeOperation(operation).defaultRange;
  }

  insertNodes(range: ModelRange, ...nodes: ModelNode[]): ModelRange {
    const op = new InsertOperation(undefined, this.cloneRange(range), ...nodes);
    this.createSnapshot();
    return this.executeOperation(op).defaultRange;
  }

  /**
   * Sets a new selection and returns whether the new selection differs from the old one
   * */
  setSelection(selection: ModelSelection) {
    const clone = this.cloneSelection(selection);
    const changed = !clone.sameAs(this._workingCopy.selection);
    if (changed) {
      const op = new SelectionOperation(
        undefined,
        this._workingCopy.selection,
        clone.ranges
      );
      this.executeOperation(op);
    }
    return changed;
  }

  setProperty(element: ModelElement, key: string, value: string): ModelElement {
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
    this.workingCopy.config.set(key, value);
  }
  removeProperty(element: ModelNode, key: string): ModelNode {
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
    const clonedRange = this.cloneRange(range);
    const op = new RemoveOperation(undefined, clonedRange, ...nodes);
    return this.executeOperation(op).defaultRange;
  }
  private executeOperation<R extends object>(op: Operation<R>): R {
    this._operations.push(op);
    const result = op.execute();
    if (op.type === 'content-operation') {
      this.rdfInvalid = true;
    }
    return result;
  }
  selectRange(range: ModelRange): void {
    const op = new SelectionOperation(undefined, this._workingCopy.selection, [
      this.cloneRange(range),
    ]);
    this.executeOperation(op);
  }
  addMarkToSelection(mark: Mark) {
    this._workingCopy.selection.activeMarks.add(mark);
    this.createSnapshot();
  }
  moveToPosition(
    rangeToMove: ModelRange,
    targetPosition: ModelPosition
  ): ModelRange {
    const rangeClone = this.cloneRange(rangeToMove);
    const posClone = this.clonePos(targetPosition);
    const op = new MoveOperation(undefined, rangeClone, posClone);
    return this.executeOperation(op).defaultRange;
  }
  removeMarkFromSelection(markname: string) {
    for (const mark of this._workingCopy.selection.activeMarks) {
      if (mark.name === markname) {
        this._workingCopy.selection.activeMarks.delete(mark);
      }
    }
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
  rollback() {
    this._workingCopy = this.initialState;
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
    return this.executeOperation(op).defaultRange.start;
  }

  insertAtPosition(position: ModelPosition, ...nodes: ModelNode[]): ModelRange {
    const posClone = this.clonePos(position);
    this.createSnapshot();
    return this.insertNodes(new ModelRange(posClone, posClone), ...nodes);
  }
  deleteNode(node: ModelNode): ModelRange {
    const range = this.cloneRange(ModelRange.fromAroundNode(node));
    this.createSnapshot();
    return this.delete(range);
  }
  delete(range: ModelRange): ModelRange {
    const op = new InsertOperation(undefined, this.cloneRange(range));
    this.createSnapshot();
    return this.executeOperation(op).defaultRange;
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
    const resultRange = this.executeOperation(op).defaultRange;
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

  removeMark(range: ModelRange, spec: MarkSpec, attributes: AttributeSpec) {
    const op = new MarkOperation(
      undefined,
      this.cloneRange(range),
      spec,
      attributes,
      'remove'
    );
    this.createSnapshot();
    return this.executeOperation(op).defaultRange;
  }

  registerCommand<N extends CommandName>(name: N, command: Commands[N]): void {
    this.workingCopy.commands[name] = command;
    this._commandCache = undefined;
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
  // canExecuteCommand<C extends keyof CommandMap>(
  //   commandName: C,
  //   args: CommandArgs<C>
  // ): boolean {
  //   const command: Command<CommandArgs<CommandName>, CommandReturn<C>> = this
  //     .workingCopy.commands[commandName];
  //   return command.canExecute(this.workingCopy, args);
  // }

  // executeCommand<C extends CommandName>(
  //   commandName: C,
  //   args: CommandArgs<C>
  // ): CommandReturn<C> | void {
  //   const command: Command<CommandArgs<C>, CommandReturn<C> | void> = this
  //     ._workingCopy.commands[commandName];
  //   const result = command.execute({ transaction: this }, args);
  //   return result;
  // }
  /**
   * Restore a state from the history
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
}
