import {
  OperationStep,
  OperationStepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import State, { cloneStateInRange } from '@lblod/ember-rdfa-editor/core/state';
import { EMPTY_MAPPER } from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import {
  modelRangeToSimpleRange,
  SimpleRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import { MarkSet } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import InsertTextOperation from '@lblod/ember-rdfa-editor/core/model/operations/insert-text-operation';

interface Args {
  range: SimpleRange;
  text: string;
  marks: MarkSet;
}

/**
 * @deprecated use {@link ReplaceStep}
 */
export default class InsertTextStep implements OperationStep {
  readonly type: StepType = 'insert-text-step';
  private readonly args: Args;

  constructor(args: Args) {
    this.args = args;
  }

  getResult(initialState: State): OperationStepResult {
    const { range, text, marks } = this.args;
    const resultState = cloneStateInRange(range, initialState);
    const op = new InsertTextOperation(
      resultState.document,
      undefined,
      range,
      text,
      marks
    );
    const { defaultRange } = op.execute();
    return {
      state: resultState,
      defaultRange: modelRangeToSimpleRange(defaultRange),
      mapper: EMPTY_MAPPER,
      timestamp: new Date(),
    };
  }
}
