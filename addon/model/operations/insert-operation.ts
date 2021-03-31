import Operation from "@lblod/ember-rdfa-editor/model/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelTreeWalker from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";

export default class InsertOperation extends Operation {
  private _node: ModelNode;

  constructor(range: ModelRange, node: ModelNode) {
    super(range);
    this._node = node;
  }

  get node(): ModelNode {
    return this._node;
  }

  set node(value: ModelNode) {
    this._node = value;
  }

  execute(): ModelRange {
    if(this.range.collapsed) {
      if(this.range.start.path.length === 0) {
        this.range.root.addChild(this.node);
        return this.range;
      }
      this.range.start.split();
      this.range.start.parent.insertChildAtOffset(this.node, this.range.start.parentOffset);
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

      this.range.start.parent.insertChildAtOffset(this.node, this.range.start.parentOffset);
      if(this.node.length) {
        return ModelRange.fromInnerContent(this.node);
      } else {
        const basePath = this.node.getOffsetPath();
        basePath[basePath.length - 1 ]++;
        return ModelRange.fromPaths(this.node.root, basePath, basePath);
      }
    }
  }

}
