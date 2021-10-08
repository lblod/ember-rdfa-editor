import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import {TextAttribute} from "@lblod/ember-rdfa-editor/core/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";

export interface Mutator {
  /**
   * @inheritDoc
   * @param range
   * @param nodes
   * @return resultRange the resulting range of the execution
   */
  insertNodes(range: ModelRange, ...nodes: ModelNode[]): ModelRange;

  insertAtPosition(position: ModelPosition, ...nodes: ModelNode[]): ModelRange;

  insertText(range: ModelRange, text: string): ModelRange;

  mergeTextNodesInRange(range: ModelRange): void;

  /**
   * @inheritDoc
   * @param rangeToMove
   * @param targetPosition
   * @return resultRange the resulting range of the execution
   */
  moveToPosition(rangeToMove: ModelRange, targetPosition: ModelPosition): ModelRange;

  /**
   * @inheritDoc
   * @param range
   * @param key
   * @param value
   * @return resultRange the resulting range of the execution
   */
  setTextProperty(range: ModelRange, key: TextAttribute, value: boolean): ModelRange;

  splitTextAt(position: ModelPosition): ModelPosition;

  splitElementAt(position: ModelPosition, splitAtEnds?: boolean): ModelPosition;

  splitUntil(position: ModelPosition, untilPredicate: (element: ModelElement) => boolean, splitAtEnds?: boolean): ModelPosition;


  /**
   * Split the given range until start.parent === startLimit
   * and end.parent === endLimit
   * The resulting range fully contains the split-off elements
   * @param range
   * @param startLimit
   * @param endLimit
   * @param splitAtEnds
   */
  splitRangeUntilElements(range: ModelRange, startLimit: ModelElement, endLimit: ModelElement, splitAtEnds?: boolean): any;

  splitUntilElement(position: ModelPosition, limitElement: ModelElement, splitAtEnds?: boolean): ModelPosition;

  /**
   * Replaces the element by its children. Returns a range containing the unwrapped children
   * @param element
   * @param ensureBlock ensure the unwrapped children are rendered as a block by surrounding them with br elements when necessary
   */
  unwrap(element: ModelElement, ensureBlock?: boolean): ModelRange;

  delete(range: ModelRange): ModelRange;

  deleteNode(node: ModelNode): ModelRange;
}
