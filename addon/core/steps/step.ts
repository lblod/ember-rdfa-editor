import State from '../state';
import ConfigStep from './config_step';
import OperationStep from './operation_step';
import SelectionStep from './selection_step';

export type StepType = 'operation-step' | 'selection-step' | 'config-step';

export default abstract class Step<R extends StepResult = StepResult> {
  abstract type: StepType;

  abstract execute(state: State): R;

  static isSelectionStep(step: Step): step is SelectionStep {
    return step.type === 'selection-step';
  }

  static isConfigStep(step: Step): step is ConfigStep {
    return step.type === 'config-step';
  }

  static isOperationStep(step: Step): step is OperationStep {
    return step.type === 'operation-step';
  }
}

export type StepResult = {
  state: State;
};
