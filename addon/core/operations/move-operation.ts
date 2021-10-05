import Operation from "@lblod/ember-rdfa-editor/core/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import OperationAlgorithms from "@lblod/ember-rdfa-editor/core/operations/operation-algorithms";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import {OperationError} from "@lblod/ember-rdfa-editor/archive/utils/errors";

export default class MoveOperation extends Operation {
  private _targetPosition: ModelPosition;
  constructor(rangeToMove: ModelRange, targetPosition: ModelPosition ) {
    super(rangeToMove);
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
    if(!this.canExecute()) {
      throw new OperationError("Cannot move to target inside source range");
    }
    const movedNodes = OperationAlgorithms.move(this.range, this.targetPosition);
    if(movedNodes.length) {
      const start = ModelPosition.fromBeforeNode(movedNodes[0]);
      const end = ModelPosition.fromAfterNode(movedNodes[movedNodes.length - 1]);
      return new ModelRange(start, end);
    } else {
      return new ModelRange(this.targetPosition, this.targetPosition);
    }
  }

}
