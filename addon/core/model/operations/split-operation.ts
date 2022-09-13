import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/utils/constants';
import Operation from './operation';

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

  execute() {
    if (this.range.collapsed) {
      const { position, mapper } = this.doSplit(this.range.start);
      const newRange = new ModelRange(position, position);
      const nodeAfter = position.nodeAfter();
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
      return {
        defaultRange: newRange,
        mapper,
        overwrittenNodes: [],
        insertedNodes: [],
        markCheckNodes: nodeAfter ? [nodeAfter] : [],
      };
    } else {
      // this is very fragile and depends heavily on execution order.
      // be careful making changes here
      const { position: end, mapper: endMapper } = this.doSplit(this.range.end);
      const { position: start, mapper: startMapper } = this.doSplit(
        endMapper.mapPosition(this.range.start)
      );
      const finalMapper = endMapper.appendMapper(startMapper);
      const newRange = new ModelRange(start, startMapper.mapPosition(end));
      const _markCheckNodes = [];
      const afterStart = start.nodeAfter();
      const afterEnd = end.nodeAfter();
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

      return {
        defaultRange: newRange,
        mapper: finalMapper,
        overwrittenNodes: [],
        insertedNodes: [],
        markCheckNodes: _markCheckNodes,
      };
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
