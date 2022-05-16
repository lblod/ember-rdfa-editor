import Operation, {
  OperationResult,
} from '@lblod/ember-rdfa-editor/model/operations/operation';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/model/operations/operation-algorithms';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/model/util/constants';
import RangeMapper from '@lblod/ember-rdfa-editor/model/range-mapper';

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

  execute(): void {
    
  }
}
