import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import {TextAttribute} from "@lblod/ember-rdfa-editor/core/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";

/**
 * The methods provided in this interface are the low-level primitives with which the
 * {@link EditorModel} can be mutated. Any methods implemented here should make use of
 * {@link Operation operations} exclusively. While hard-enforcing this restriction is planned,
 * it is not a top-priority since {@link EditorPlugin plugins} cannot provide extensions here.
 *
 * While there is no hard requirement for the interface to these methods, most of them
 * take a {@link ModelRange} as input and return a {@link ModelRange} as output.
 * This is intentionally "just a convention". Some things are better left unenforced.
 * The output range should be a "sensible default" resulting range after the modification has happenen.
 *
 * e.g.: after inserting multiple nodes, a sensible range to return could be a range that encompasses all the inserted
 * nodes exactly.
 *
 * When deciding what range to return, keep in mind that if you return an uncollapsed range, it is easy to collapse
 * that to either of its extremes, but the other way round is more difficult.
 */
export interface Mutator {
  insertNodes(range: ModelRange, ...nodes: ModelNode[]): ModelRange;

  insertAtPosition(position: ModelPosition, ...nodes: ModelNode[]): ModelRange;

  insertText(range: ModelRange, text: string): ModelRange;

  mergeTextNodesInRange(range: ModelRange): void;

  moveToPosition(rangeToMove: ModelRange, targetPosition: ModelPosition): ModelRange;

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
  splitRangeUntilElements(range: ModelRange, startLimit: ModelElement, endLimit: ModelElement, splitAtEnds?: boolean): ModelRange;

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
