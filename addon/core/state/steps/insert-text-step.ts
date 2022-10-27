import {
  OperationStep,
  OperationStepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import State, { cloneStateInRange } from '@lblod/ember-rdfa-editor/core/state';
import { LeftOrRight } from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import {
  modelRangeToSimpleRange,
  SimpleRange,
  simpleRangeToModelRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import { MarkSet } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import InsertTextOperation from '@lblod/ember-rdfa-editor/core/model/operations/insert-text-operation';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';

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
      simpleRangeToModelRange(range, resultState.document),
      text,
      marks
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
