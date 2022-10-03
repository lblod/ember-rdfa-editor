import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/utils/constants';
import RangeMapper from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import Operation from './operation';

export default class RemoveOperation extends Operation {
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
    const _markCheckNodes: ModelNode[] = [];

    const { mapper, removedNodes } = OperationAlgorithms.removeNew(this.range);
    const overwrittenNodes: ModelNode[] = removedNodes;
    const resultMapper: RangeMapper = mapper;

    const defaultRange = new ModelRange(this.range.start, this.range.start);
    this.emit(
      new ContentChangedEvent({
        owner: CORE_OWNER,
        payload: {
          type: 'remove',
          oldRange: this.range,
          newRange: defaultRange,
          insertedNodes: [],
          overwrittenNodes,
          _markCheckNodes,
        },
      })
    );
    return {
      defaultRange,
      mapper: resultMapper,
      insertedNodes: [],
      overwrittenNodes,
      markCheckNodes: _markCheckNodes,
    };
  }
}
