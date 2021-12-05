import Operation from '@lblod/ember-rdfa-editor/model/operations/operation';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/model/operations/operation-algorithms';

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
