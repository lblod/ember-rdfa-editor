import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import Operation from '@lblod/ember-rdfa-editor/model/operations/operation';
import RangeMapper from '@lblod/ember-rdfa-editor/model/range-mapper';
import State from '../state';
import Step, { StepResult, StepType } from './step';

export default class OperationStep extends Step<OperationStepResult> {
  type: StepType = 'operation-step';

  constructor(readonly operation: Operation) {
    super();
  }
  execute(state: State): OperationStepResult {
    const operationResult = this.operation.execute();
    return {
      ...operationResult,
      state,
    };
  }
}

type OperationStepResult = StepResult & {
  mapper: RangeMapper;
  defaultRange: ModelRange;
};
