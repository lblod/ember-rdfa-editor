import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/utils/constants';
import { SimpleRangeMapper } from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import Operation from './operation';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import {
  SimpleRange,
  simpleRangeToModelRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import { simplePosToModelPos } from '@lblod/ember-rdfa-editor/core/model/simple-position';

export default class RemoveOperation extends Operation {
  constructor(
    root: ModelElement,
    eventBus: EventBus | undefined,
    range: SimpleRange
  ) {
    super(root, eventBus, range);
  }

  execute() {
    const _markCheckNodes: ModelNode[] = [];

    const { mapper, removedNodes } = OperationAlgorithms.removeNew(
      this.root,
      this.range
    );
    const overwrittenNodes: ModelNode[] = removedNodes;
    const resultMapper: SimpleRangeMapper = mapper;

    const defaultPos = simplePosToModelPos(this.range.start, this.root);
    const defaultRange = new ModelRange(defaultPos, defaultPos);
    this.emit(
      new ContentChangedEvent({
        owner: CORE_OWNER,
        payload: {
          type: 'remove',
          oldRange: simpleRangeToModelRange(this.range, this.root),
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
