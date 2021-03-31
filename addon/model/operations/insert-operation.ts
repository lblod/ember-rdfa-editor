import Operation from "@lblod/ember-rdfa-editor/model/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

export default class InsertOperation extends Operation {
  private _nodes: ModelNode[];

  constructor(range: ModelRange, ...nodes: ModelNode[]) {
    super(range);
    this._nodes = nodes;
  }

  get nodes(): ModelNode[] {
    return this._nodes;
  }

  set nodes(value: ModelNode[]) {
    this._nodes = value;
  }

  execute(): ModelRange {
    if(this.range.collapsed) {
      if(this.range.start.path.length === 0) {
        this.range.root.appendChildren(...this.nodes);
        return this.range;
      }
      this.range.start.split();
      this.range.start.parent.insertChildrenAtOffset(this.range.start.parentOffset, ...this.nodes);
      return this.range;
    } else {
      this.range.start.split();
      this.range.end.split();
      const confinedRanges = this.range.getMinimumConfinedRanges();
      const nodesToRemove = [];
      for (const range of confinedRanges) {
        const walker = new ModelTreeWalker({range, descend: false});
        nodesToRemove.push(...walker);
      }
      for (const node of nodesToRemove) {
        node.remove();
      }

      this.range.start.parent.insertChildrenAtOffset(this.range.start.parentOffset, ...this.nodes);
      const first = this.nodes[0];
      const last = this.nodes[this.nodes.length - 1];
      const start = ModelPosition.fromBeforeNode(first);
      const end = ModelPosition.fromAfterNode(last);
      return new ModelRange(start, end);
    }
  }

}
