import Operation from "@lblod/ember-rdfa-editor/core/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import OperationAlgorithms from "@lblod/ember-rdfa-editor/core/operations/operation-algorithms";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import {OperationError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";
import {AfterMoveOperationEvent} from "@lblod/ember-rdfa-editor/core/editor-events";

export default class MoveOperation extends Operation {
  private _targetPosition: ModelPosition;

  constructor(eventBus: EventBus, rangeToMove: ModelRange, targetPosition: ModelPosition) {
    super(eventBus, rangeToMove);
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

  execute(): ModelRange {
    const result = this.doExecute();
    this.eventBus.emit(new AfterMoveOperationEvent(this));
    return result;
  }

  private doExecute(): ModelRange {
    if (!this.canExecute()) {
      throw new OperationError("Cannot move to target inside source range");
    }
    const movedNodes = OperationAlgorithms.move(this.range, this.targetPosition);
    if (movedNodes.length) {
      const start = ModelPosition.fromBeforeNode(movedNodes[0]);
      const end = ModelPosition.fromAfterNode(movedNodes[movedNodes.length - 1]);
      return new ModelRange(start, end);
    } else {
      return new ModelRange(this.targetPosition, this.targetPosition);
    }

  }

}
