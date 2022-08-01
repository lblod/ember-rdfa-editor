import State, { SayState } from '../state';
import Step, { StepResult, StepType } from './step';

export default class ConfigStep extends Step {
  type: StepType = 'config-step';

  constructor(readonly key: string, readonly value: string | null) {
    super();
  }
  execute(state: State): StepResult {
    const newConfig = new Map(state.config);
    newConfig.set(this.key, this.value);
    const newState = new SayState({
      ...state,
      config: newConfig,
    });
    return { state: newState };
  }
}
