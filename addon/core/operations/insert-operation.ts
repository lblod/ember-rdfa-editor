import Operation from "@lblod/ember-rdfa-editor/core/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import OperationAlgorithms from "@lblod/ember-rdfa-editor/core/operations/operation-algorithms";
import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";

/**
 * The insert operation deals with inserting a list of nodes into a certain range.
 * It is defined over a target range and a list of nodes to insert.
 * **This list may be empty** (see below).
 * Any content in the target range will get overwritten.
 *
 *  # Collapsed Range
 *
 *  Inserting nodes into a collapsed range is fairly intuitive to understand. The algorithm goes as follows:
 *
 *  - Split the textnode at range.start if necessary
 *  - insert the nodes one by one, left to right at that position.
 *  - return a collapsed range set after the last inserted node
 *
 *  Some invariants this implies:
 *  - the first node of the nodeList will have previousSibling set to the node before the start position (or null if there is none)
 *  - the last node of the nodeList will have nextSibling set to the node after the start position
 *  (remember, we split first so this may be part of the textnode that was there before)
 *
 *  ### empty nodeList
 *
 *  If the range is collapsed and the nodeList is empty, the split still happens, but no nodes are inserted.
 *  The resulting range is the same as the target range.
 *
 *  # Uncollapsed Range
 *
 *  With uncollapsed ranges, there are multiple ways to logically define an overwriting insert operation.
 *  We do it as follows:
 *
 *  - delete the nodes in the range (see below)
 *  - insert the nodes in the nodeList into the parentElement of the startPosition, at the parentOffset of that position
 *  - return a range encompassing the newly inserted nodes
 *
 *  ### empty nodeList
 *
 *  With an empty nodeList, the nodes in the range are deleted, and none are inserted.
 *  The resulting range is collapsed at range.start.
 *
 *  # Deleting nodes
 *
 *  Because the InsertOperation both overwrites and supports "inserting" an empty list,
 *  we can see that it doubles as a DeleteOperation.
 *  Once again, deleting nodes in a range can have multiple definitions. Here is how we do it:
 *
 *  - split the textNodes at start and end if necessary
 *  - get the {@link ModelRange.getMinimumConfinedRanges minimum confined ranges} set of the range
 *  - for every confined range in the set, use the {@link ModelTreeWalker} to walk from start to end **without descending**
 *  - for every node that we encountered, remove it from the tree
 *
 *
 *  _reminder_: a confined range is a range for which the start and end position have the same parent
 *
 *  A nice way to visualize this algorithm is as follows:
 *
 *  - take the xml representation of the tree and paste it in your favorite text editor
 *  - split the textnodes at the start and end (aka `<text>abcd</text>` becomes `<text>ab</text><text>cd</text>` for example)
 *  - put your cursor at the start position (this will now always be right before a full node because of the split*)
 *  - drag a selection until the end position
 *
 *  Every node for which **both its start and end** tags are fully selected will be deleted.
 *  Nodes with only their start **or** end tags in the selection will **not** be deleted
 *  and their structure will be preserved.
 *
 *  (You can also look at it as follows: with your selection as described above,
 *  hit delete, and then repair the resulting xml by adding start and end tags where appropriate)
 *
 *  \* quick reminder: with {@link ModelPosition modelpositions}
 *  `|<text>...</text>` is the same position as `<text>|....</text>`, so choose the former here
 *
 *  ### collapsed range
 *
 *  When the range is collapsed, the split will still occur but no nodes will be deleted.
 */
export default class InsertOperation extends Operation {
  private _nodes: ModelNode[];

  constructor(eventBus: EventBus, range: ModelRange, ...nodes: ModelNode[]) {
    super(eventBus, range);
    this._nodes = nodes;
  }

  get nodes(): ModelNode[] {
    return this._nodes;
  }

  set nodes(value: ModelNode[]) {
    this._nodes = value;
  }

  execute(): ModelRange {
    if (!this.nodes.length) {
      const nodeAtEnd = this.range.end.nodeAfter();
      if (nodeAtEnd) {
        OperationAlgorithms.remove(this.range);
        return ModelRange.fromInNode(nodeAtEnd, 0, 0);
      } else {
        // this depends on the behavior that the remove algorithm will never remove
        // the parent of the edges of its range
        const parent = this.range.end.parent;
        OperationAlgorithms.remove(this.range);
        const pos = ModelPosition.fromAfterNode(parent);
        return new ModelRange(pos, pos);
      }
    }

    OperationAlgorithms.insert(this.range, ...this.nodes);
    if (this.range.collapsed) {
      const last = this.nodes[this.nodes.length - 1];
      const pos = ModelPosition.fromAfterNode(last);
      return new ModelRange(pos, pos);
    }

    const first = this.nodes[0];
    const last = this.nodes[this.nodes.length - 1];
    const start = ModelPosition.fromBeforeNode(first);
    const end = ModelPosition.fromAfterNode(last);
    return new ModelRange(start, end);
  }
}
