import Operation from "@lblod/ember-rdfa-editor/model/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import OperationAlgorithms from "@lblod/ember-rdfa-editor/model/operations/operation-algorithms";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

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
  execute(): ModelRange {
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
