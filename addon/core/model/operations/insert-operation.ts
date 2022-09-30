import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/utils/constants';
import RangeMapper from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import Operation from './operation';

export default class InsertOperation extends Operation {
  private _nodes: ModelNode[];

  constructor(
    eventBus: EventBus | undefined,
    range: ModelRange,
    ...nodes: ModelNode[]
  ) {
    super(eventBus, range);
    this._nodes = nodes;
  }

  get nodes(): ModelNode[] {
    return this._nodes;
  }

  set nodes(value: ModelNode[]) {
    this._nodes = value;
  }

  execute() {
    let overwrittenNodes: ModelNode[];
    let resultMapper: RangeMapper;
    let _markCheckNodes: ModelNode[] = [];
    if (!this.nodes.length) {
      const { mapper, removedNodes } = OperationAlgorithms.remove(this.range);
      overwrittenNodes = removedNodes;
      resultMapper = mapper;
    } else {
      const insertionResult = OperationAlgorithms.insert(
        this.range,
        ...this.nodes
      );
      overwrittenNodes = insertionResult.overwrittenNodes;
      _markCheckNodes = insertionResult._markCheckNodes;
      resultMapper = insertionResult.mapper;
    }
    const defaultRange = resultMapper.mapRange(this.range);
    this.emit(
      new ContentChangedEvent({
        owner: CORE_OWNER,
        payload: {
          type: 'insert',
          oldRange: this.range,
          newRange: defaultRange,
          insertedNodes: this.nodes,
          overwrittenNodes,
          _markCheckNodes,
        },
      })
    );
    return {
      defaultRange,
      mapper: resultMapper,
      insertedNodes: this.nodes,
      overwrittenNodes,
      markCheckNodes: _markCheckNodes,
    };
  }
}
