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
import State, { cloneStateInRange } from '@lblod/ember-rdfa-editor/core/state';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import RemoveOperation from '@lblod/ember-rdfa-editor/core/model/operations/remove-operation';

interface Args {
  range: SimpleRange;
}

/**
 * @deprecated try to use {@link ReplaceStep}, but might need to be undeprecated
 */
export default class RemoveStep implements OperationStep {
  readonly type: StepType = 'remove-step';

  private readonly args: Args;

  constructor(args: Args) {
    this.args = args;
  }

  getResult(initialState: State): OperationStepResult {
    const { range } = this.args;
    const resultState = cloneStateInRange(range, initialState);
    const op = new RemoveOperation(
      resultState.document,
      undefined,
      simpleRangeToModelRange(range, resultState.document)
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
