import Operation from "@lblod/ember-rdfa-editor/model/operations/operation";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import OperationAlgorithms from "@lblod/ember-rdfa-editor/model/operations/operation-algorithms";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

export default class MoveOperation extends Operation {
  private _targetRange: ModelRange;
  constructor(rangeToMove: ModelRange, targetRange: ModelRange ) {
    super(rangeToMove);
    this._targetRange = targetRange;
  }
  get targetRange(): ModelRange {
    return this._targetRange;
  }

  set targetRange(value: ModelRange) {
    this._targetRange = value;
  }
  execute(): ModelRange {
    const movedNodes = OperationAlgorithms.move(this.range, this.targetRange);
    if(movedNodes.length) {
      const start = ModelPosition.fromBeforeNode(movedNodes[0]);
      const end = ModelPosition.fromAfterNode(movedNodes[movedNodes.length - 1]);
      return new ModelRange(start, end);
    } else {
      return this.targetRange;
    }
  }

}
