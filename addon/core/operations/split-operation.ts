import Operation from "@lblod/ember-rdfa-editor/core/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import OperationAlgorithms from "@lblod/ember-rdfa-editor/core/operations/operation-algorithms";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import {ModelError} from "@lblod/ember-rdfa-editor/util/errors";
import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";
import {AfterSplitOperationEvent} from "@lblod/ember-rdfa-editor/core/editor-events";

/**
 * The split operation deals with splitting nodes into two new nodes at a certain position.
 * Both nodes will have identical types and attributes.
 *
 * Like all operations, the split operation is defined over a ModelRange.
 * In addition to the range, the split operation also takes a splitParent boolean, which is true by default.
 * If splitParent is false, only textNodes at the edges of the range will be split.
 * If it is true, textnodes will be split, and also the parentelement of the start and endpositions.
 *
 *
 *  # Splitting
 *
 * While the operation is defined on a range, it makes more sense to describe the splitting algorithm with a single position.
 * We define a single splitting operation on a position as follows:
 *
 * - if position is inside of a textnode, split it at that position.
 *
 * This will result in two textnodes either side of the position.
 * The resulting position will be unchanged. e.g.:
 *
 * ```xml
 * <text>ab|cd</text>
 * ```
 *
 * will become
 *
 * ```xml
 * <text>ab</text>|<text>cd</text>
 * ```
 *
 * - then, if parentElement is true, split the parent of position. This goes as follows:
 *     - create a shallow copy of the parent (a new node with identical type and attributes, but without any children)
 *     - add all children of the parent after the position to the copy
 *     - add the copy to the parent of the parent, at index parent.index + 1 (so the copy ends up being the nextSibling of the parent), e.g:
 *       ```xml
 *       <div><text>ab|cd</text></div>
 *       ```
 *       will become
 *       ```xml
 *       <div><text>ab</text></div>|<div><text>cd></text></div>
 *       ```
 *     - the resulting position is right between the parent and the copy
 *
 * # Ranges
 *
 * With the above algorithm in mind, we can now define how ranges are handled.
 *
 * ## Collapsed range:
 *
 * - perform the split on range.start.
 * - The resulting range is a collapsed range on the resulting position
 *
 * ## Uncollapsed range:
 *
 * - perform the split on range.end
 * - perform the split on range.start
 * - the resulting range contains all content that was originally selected.
 * This is not simply the same as a range made up of the two resulting positions,
 * since the position from the first split will be invalid after the second split.
 */
export default class SplitOperation extends Operation {
  private _splitParent: boolean;

  constructor(eventBus: EventBus, range: ModelRange, splitParent = true) {
    super(eventBus, range);
    this._splitParent = splitParent;
  }

  get splitParent(): boolean {
    return this._splitParent;
  }

  set splitParent(value: boolean) {
    this._splitParent = value;
  }

  execute(): ModelRange {
    const result = this.doExecute();
    this.eventBus.emit(new AfterSplitOperationEvent(this));
    return result;
  }

  private doExecute(): ModelRange {
    if (this.range.collapsed) {
      const newPos = this.doSplit(this.range.start);
      return new ModelRange(newPos, newPos);
    } else {
      // this is very fragile and depends heavily on execution order.
      // be careful making changes here
      const end = this.doSplit(this.range.end);
      const afterEnd = end.nodeAfter();
      if (!afterEnd) {
        throw new ModelError("Unexpected model state");
      }
      const start = this.doSplit(this.range.start);
      return new ModelRange(start, ModelPosition.fromBeforeNode(afterEnd));
    }

  }

  private doSplit(position: ModelPosition) {
    if (this._splitParent) {
      return OperationAlgorithms.split(position);
    } else {
      return OperationAlgorithms.splitText(position);
    }
  }

}
