import {
  modelRangeToSimpleRange,
  SimpleRange,
  simpleRangeToModelRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import {
  OperationStep,
  OperationStepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import { LeftOrRight } from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import State, { cloneStateShallow } from '@lblod/ember-rdfa-editor/core/state';
import {
  SimplePosition,
  simplePosToModelPos,
} from '@lblod/ember-rdfa-editor/core/model/simple-position';
import MoveOperation from '@lblod/ember-rdfa-editor/core/model/operations/move-operation';

interface Args {
  rangeToMove: SimpleRange;
  targetPosition: SimplePosition;
}

/**
 * @deprecated use {@link ReplaceStep}
 */
export default class MoveStep implements OperationStep {
  readonly type: StepType = 'move-step';

  private readonly args: Args;

  constructor(args: Args) {
    this.args = args;
  }

  getResult(initialState: State): OperationStepResult {
    const { rangeToMove, targetPosition } = this.args;
    const resultState = cloneStateShallow(initialState);
    // we clone the whole document as a shortcut to avoid having to
    // calculate the affected range of the move
    resultState.document = resultState.document.clone();
    const op = new MoveOperation(
      resultState.document,
      undefined,
      simpleRangeToModelRange(rangeToMove, resultState.document),
      simplePosToModelPos(targetPosition, resultState.document)
    );
    const { defaultRange } = op.execute();
    return {
      state: resultState,
      defaultRange: modelRangeToSimpleRange(defaultRange),
    };
  }

  mapPosition(position: SimplePosition, bias?: LeftOrRight): SimplePosition {
    return position;
  }

  mapRange(range: SimpleRange, bias?: LeftOrRight): SimpleRange {
    return range;
  }
}
