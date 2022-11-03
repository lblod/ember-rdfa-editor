import { SimpleRange } from '@lblod/ember-rdfa-editor/core/model/simple-range';
import {
  OperationStep,
  OperationStepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import State, { cloneStateInRange } from '@lblod/ember-rdfa-editor/core/state';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';

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
    const { mapper } = OperationAlgorithms.removeNew(
      resultState.document,
      range
    );
    return {
      state: resultState,
      defaultRange: mapper.mapRange(range),
      mapper,
    };
  }
}
