import {
  OperationStep,
  OperationStepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import { LeftOrRight } from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import {
  modelRangeToSimpleRange,
  SimpleRange,
  simpleRangeToModelRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import State, { cloneStateInRange } from '@lblod/ember-rdfa-editor/core/state';
import { MarkSpec } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import { AttributeSpec } from '@lblod/ember-rdfa-editor/utils/render-spec';
import MarkOperation, {
  MarkAction,
} from '@lblod/ember-rdfa-editor/core/model/operations/mark-operation';

interface Args {
  range: SimpleRange;
  spec: MarkSpec;
  attributes: AttributeSpec;
  action: MarkAction;
}

export default class MarkStep implements OperationStep {
  readonly type: StepType = 'mark-step';

  private readonly args: Args;

  constructor(args: Args) {
    this.args = args;
  }

  getResult(initialState: State): OperationStepResult {
    const { range, spec, attributes, action } = this.args;
    const resultState = cloneStateInRange(range, initialState);
    const op = new MarkOperation(
      resultState.document,
      undefined,
      simpleRangeToModelRange(range, resultState.document),
      spec,
      attributes,
      action
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
