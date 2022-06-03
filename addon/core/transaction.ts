import State, { cloneState } from '@lblod/ember-rdfa-editor/core/state';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { AttributeSpec, Mark, MarkSet, MarkSpec } from '../model/mark';
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
import EventBus from '../utils/event-bus';

interface TextInsertion {
  range: ModelRange;
  text: string;
  marks?: MarkSet;
}

/**
 * This is the main way to produce a new state based on an initial state.
 * As such, this class implements all editing primitives available.
 * */
export default class Transaction {
  initialState: State;
  private workingCopy: State;
  needsToWrite: boolean;
  operations: Operation[];
  rangeMapper: RangeMapper;

  constructor(state: State) {
    this.initialState = state;
    /*
     * Current implementation is heavily influenced by time and complexity constraints.
     * By simply copying the state and then mutating the copy, most logic could be ported over verbatim.
     * However this simplicity comes at a cost of awkward workarounds in certain situations,
     * so is an immediate target for improvement later.
     */
    this.workingCopy = cloneState(state);
    this.needsToWrite = false;
    this.operations = [];
    this.rangeMapper = new RangeMapper();
  }

  setPlugins(plugins: InitializedPlugin[]): void {
    this.workingCopy.plugins = plugins;
  }
  setBaseIRI(iri: string): void {
    this.workingCopy.baseIRI = iri;
  }
  setPathFromDomRoot(path: Node[]) {
    this.workingCopy.pathFromDomRoot = path;
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
    return this.executeOperation(op);
  }

  /**
   * Build the new state from the viewstate (aka the DOM)
   * Typically done as (one of) the first transaction upon loading the editor.
   * */
  readFromView(view: View): void {
    const htmlReader = new HtmlReader();
    const context = new HtmlReaderContext({
      marksRegistry: this.workingCopy.marksRegistry,
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
      this.workingCopy,
      view.domRoot,
      getWindowSelection()
    );

    this.workingCopy.document = newVdom;
    this.workingCopy.selection = newSelection;
    // this.needsToWrite = true;
    this.createSnapshot();
  }

  /**
   * Produce the new state from the initial state.
   * It is left to implementation details what this means,
   * providing flexibility to implement batch-style editing or otherwise.
   * */
  apply(): State {
    if (
      this.initialState.baseIRI !== this.workingCopy.baseIRI ||
      this.initialState.pathFromDomRoot !== this.workingCopy.pathFromDomRoot ||
      this.workingCopy !== this.initialState
    ) {
      this.workingCopy.datastore = EditorStore.fromParse({
        modelRoot: this.workingCopy.document,
        baseIRI: this.workingCopy.baseIRI,
        pathFromDomRoot: this.workingCopy.pathFromDomRoot,
      });
    }
    return this.workingCopy;
  }

  insertText({ range, text, marks }: TextInsertion): ModelRange {
    const operation = new InsertTextOperation(
      undefined,
      this.cloneRange(range),
      text,
      marks || new MarkSet()
    );
    this.createSnapshot();
    return operation.execute().defaultRange;
  }

  insertNodes(range: ModelRange, ...nodes: ModelNode[]): ModelRange {
    const op = new InsertOperation(undefined, this.cloneRange(range), ...nodes);
    this.createSnapshot();
    return this.executeOperation(op);
  }

  setSelection(selection: ModelSelection) {
    const clone = this.cloneSelection(selection);
    if (!clone.sameAs(this.workingCopy.selection)) {
      this.needsToWrite = true;
    }
    this.workingCopy.selection = clone;
  }

  setProperty(element: ModelElement, key: string, value: string): ModelElement {
    const oldNode = element;
    if (!oldNode) throw new Error('no element in range');
    const newNode = oldNode.clone();
    newNode.setAttribute(key, value);
    const oldNodeRange = ModelRange.fromAroundNode(oldNode);
    const op = new InsertOperation(
      undefined,
      this.cloneRange(oldNodeRange),
      newNode
    );
    this.executeOperation(op);
    return newNode;
  }

  removeProperty(element: ModelElement, key: string): ModelElement {
    const oldNode = element;
    if (!oldNode) throw new Error('no element in range');
    const newNode = oldNode.clone();
    newNode.removeAttribute(key);
    const oldNodeRange = ModelRange.fromAroundNode(oldNode);
    const op = new InsertOperation(
      undefined,
      this.cloneRange(oldNodeRange),
      newNode
    );
    this.executeOperation(op);
    return newNode;
  }
  private executeOperation(op: Operation): ModelRange {
    const { defaultRange } = op.execute();
    // this.mapper.appendMapper(mapper);
    return defaultRange;
  }
  selectRange(range: ModelRange): void {
    this.workingCopy.selection.selectRange(this.cloneRange(range));
  }
  addMarkToSelection(mark: Mark) {
    this.workingCopy.selection.activeMarks.add(mark);
    this.createSnapshot();
  }
  removeMarkFromSelection(markname: string) {
    for (const mark of this.workingCopy.selection.activeMarks) {
      if (mark.name === markname) {
        this.workingCopy.selection.activeMarks.delete(mark);
      }
    }
    this.createSnapshot();
  }
  /**
   * Make a snapshot of the new state, meaning that it will be registered
   * in the history and can be recalled later.
   * */
  createSnapshot() {
    this.workingCopy.previousState = this.initialState;
    return this.initialState;
  }
  /**
   * Reset this transaction, discarding any changes made
   * */
  rollback() {
    this.workingCopy = this.initialState;
    return this.workingCopy;
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
    this.createSnapshot();
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
    return this.executeOperation(op).start;
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
    return this.executeOperation(op);
  }
  /**
   * Clone a range and set its root in the new state.
   * This is currently public to provide a workaround for various editing implementations
   * which depended on stateful logic, but should eventually become private or dissapear
   * */
  cloneRange(range: ModelRange): ModelRange {
    if (range.root !== this.workingCopy.document) {
      return range.clone(this.workingCopy.document);
    } else {
      return range;
    }
  }
  /**
   * Position version of @link{cloneRange}
   * */
  clonePos(pos: ModelPosition): ModelPosition {
    return pos.clone(this.workingCopy.document);
  }
  /**
   * Selection version of @link{cloneRange}
   * */
  cloneSelection(selection: ModelSelection): ModelSelection {
    return selection.clone(this.workingCopy.document);
  }
  collapseIn(node: ModelNode, offset = 0) {
    this.workingCopy.selection.clearRanges();
    this.workingCopy.selection.addRange(
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

  removeMark(range: ModelRange, spec: MarkSpec, attributes: AttributeSpec) {
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
  /**
   * Restore a state from the history
   * @param steps Amount of steps to look back
   * */
  restoreSnapshot(steps: number) {
    let prev: State | null = this.initialState;
    let reverts = 0;
    while (prev && reverts < steps) {
      this.workingCopy = prev;
      prev = prev.previousState;
      reverts++;
    }
    if (prev) {
      this.workingCopy = prev;
    }
  }

  /**
   * Find the relative node in the workingcopy
   * TODO: this is a shortcut, should ultimately not be needed
   * */
  inWorkingCopy<N extends ModelNode>(node: N): N {
    if (node.root === this.workingCopy.document) {
      return node;
    }
    const pos = this.clonePos(ModelPosition.fromBeforeNode(node));
    return pos.nodeAfter()! as N;
  }
}
