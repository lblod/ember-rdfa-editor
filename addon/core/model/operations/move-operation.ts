import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import { OperationError } from '@lblod/ember-rdfa-editor/utils/errors';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import { ContentChangedEvent } from '@lblod/ember-rdfa-editor/utils/editor-event';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/utils/constants';
import Operation from './operation';

export default class MoveOperation extends Operation {
  private _targetPosition: ModelPosition;

  constructor(
    eventbus: EventBus | undefined,
    rangeToMove: ModelRange,
    targetPosition: ModelPosition
  ) {
    super(eventbus, rangeToMove);
    this._targetPosition = targetPosition;
  }

  get targetPosition(): ModelPosition {
    return this._targetPosition;
  }

  set targetPosition(value: ModelPosition) {
    this._targetPosition = value;
  }

  canExecute(): boolean {
    return !this.targetPosition.isBetween(this.range.start, this.range.end);
  }

  execute() {
    if (!this.canExecute()) {
      throw new OperationError('Cannot move to target inside source range');
    }
    const { movedNodes, _markCheckNodes, mapper } = OperationAlgorithms.move(
      this.range,
      this.targetPosition
    );
    if (movedNodes.length) {
      const start = ModelPosition.fromBeforeNode(movedNodes[0]);
      const end = ModelPosition.fromAfterNode(
        movedNodes[movedNodes.length - 1]
      );
      const newRange = new ModelRange(start, end);
      this.emit(
        new ContentChangedEvent({
          owner: CORE_OWNER,
          payload: {
            type: 'move',
            startRange: this.range,
            resultRange: newRange,
            insertedNodes: movedNodes,
            targetPosition: this.targetPosition,
            _markCheckNodes,
          },
        })
      );
      return {
        defaultRange: newRange,
        mapper,
        insertedNodes: movedNodes,
        overwrittenNodes: [],
        markCheckNodes: _markCheckNodes,
      };
    } else {
      const newRange = new ModelRange(this.targetPosition, this.targetPosition);
      this.emit(
        new ContentChangedEvent({
          owner: CORE_OWNER,
          payload: {
            type: 'move',
            startRange: this.range,
            resultRange: newRange,
            insertedNodes: [],
            targetPosition: this.targetPosition,
            _markCheckNodes,
          },
        })
      );
      return {
        defaultRange: newRange,
        mapper,
        insertedNodes: [],
        overwrittenNodes: [],
        markCheckNodes: _markCheckNodes,
      };
    }
  }
}
