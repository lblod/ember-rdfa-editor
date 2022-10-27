import {
  OperationStep,
  OperationStepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import {
  modelRangeToSimpleRange,
  SimpleRange,
  simpleRangeToModelRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import { LeftOrRight } from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import State, { cloneStateInRange } from '@lblod/ember-rdfa-editor/core/state';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import SplitOperation from '@lblod/ember-rdfa-editor/core/model/operations/split-operation';

interface Args {
  range: SimpleRange;
  splitParent?: boolean;
}

/**
 * @deprecated try to use {@link ReplaceStep}
 */
export default class SplitStep implements OperationStep {
  readonly type: StepType = 'split-step';

  private readonly args: Args;

  constructor(args: Args) {
    this.args = args;
  }

  getResult(initialState: State): OperationStepResult {
    const { range, splitParent } = this.args;
    const resultState = cloneStateInRange(range, initialState);
    const op = new SplitOperation(
      resultState.document,
      undefined,
      simpleRangeToModelRange(range, resultState.document),
      splitParent
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
