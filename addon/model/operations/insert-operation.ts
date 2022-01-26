import Operation from '@lblod/ember-rdfa-editor/model/operations/operation';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/model/operations/operation-algorithms';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/model/util/constants';

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
    let resultRange: ModelRange;
    let overwrittenNodes: ModelNode[];
    let _markCheckNodes: ModelNode[] = [];
    if (!this.nodes.length) {
      const nodeAtEnd = this.range.end.nodeAfter();
      if (nodeAtEnd) {
        overwrittenNodes = OperationAlgorithms.remove(this.range);
        resultRange = ModelRange.fromInNode(nodeAtEnd, 0, 0);
      } else {
        // this depends on the behavior that the remove algorithm will never remove
        // the parent of the edges of its range
        const parent = this.range.end.parent;
        overwrittenNodes = OperationAlgorithms.remove(this.range);
        const pos = ModelPosition.fromAfterNode(parent);
        resultRange = new ModelRange(pos, pos);
      }
    } else {
      const insertionResult = OperationAlgorithms.insert(
        this.range,
        ...this.nodes
      );
      overwrittenNodes = insertionResult.overwrittenNodes;
      _markCheckNodes = insertionResult._markCheckNodes;
      if (this.range.collapsed) {
        const last = this.nodes[this.nodes.length - 1];
        const pos = ModelPosition.fromAfterNode(last);
        resultRange = new ModelRange(pos, pos);
      }

      const first = this.nodes[0];

      const last = this.nodes[this.nodes.length - 1];
      const start = ModelPosition.fromBeforeNode(first);
      const end = ModelPosition.fromAfterNode(last);
      resultRange = new ModelRange(start, end);
    }
    this.emit(
      new ContentChangedEvent({
        owner: CORE_OWNER,
        payload: {
          type: 'insert',
          oldRange: this.range,
          newRange: resultRange,
          insertedNodes: this.nodes,
          overwrittenNodes,
          _markCheckNodes,
        },
      })
    );
    return resultRange;
  }
}
