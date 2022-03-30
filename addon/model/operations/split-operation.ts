import Operation, {
  OperationResult,
} from '@lblod/ember-rdfa-editor/model/operations/operation';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/model/operations/operation-algorithms';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/model/util/constants';
import RangeMapper from '@lblod/ember-rdfa-editor/model/range-mapper';

export default class SplitOperation extends Operation {
  private _splitParent: boolean;

  constructor(
    eventbus: EventBus | undefined,
    range: ModelRange,
    splitParent = true
  ) {
    super(eventbus, range);
    this._splitParent = splitParent;
  }

  get splitParent(): boolean {
    return this._splitParent;
  }

  set splitParent(value: boolean) {
    this._splitParent = value;
  }

  execute(): OperationResult {
    if (this.range.collapsed) {
      const newPos = this.doSplit(this.range.start);
      const newRange = new ModelRange(newPos, newPos);
      const nodeAfter = newPos.nodeAfter();
      this.emit(
        new ContentChangedEvent({
          owner: CORE_OWNER,
          payload: {
            type: 'insert',
            oldRange: this.range,
            newRange,
            overwrittenNodes: [],
            insertedNodes: [],
            _markCheckNodes: nodeAfter ? [nodeAfter] : [],
          },
        })
      );
      return { defaultRange: newRange, mapper: new RangeMapper() };
    } else {
      // this is very fragile and depends heavily on execution order.
      // be careful making changes here
      const end = this.doSplit(this.range.end);
      const afterEnd = end.nodeAfter();
      if (!afterEnd) {
        throw new ModelError('Unexpected model state');
      }
      const start = this.doSplit(this.range.start);
      const newRange = new ModelRange(
        start,
        ModelPosition.fromBeforeNode(afterEnd)
      );
      const _markCheckNodes = [];
      const afterStart = start.nodeAfter();
      if (afterStart) {
        _markCheckNodes.push(afterStart);
      }
      if (afterEnd) {
        _markCheckNodes.push(afterEnd);
      }
      this.emit(
        new ContentChangedEvent({
          owner: CORE_OWNER,
          payload: {
            type: 'insert',
            oldRange: this.range,
            newRange,
            overwrittenNodes: [],
            insertedNodes: [],
            _markCheckNodes,
          },
        })
      );

      return { defaultRange: newRange, mapper: new RangeMapper() };
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
