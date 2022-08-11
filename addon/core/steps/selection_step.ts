import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import State, { cloneStateShallow } from '../state';
import Step, { StepResult, StepType } from './step';

export default class SelectionStep extends Step {
  type: StepType = 'selection-step';

  constructor(readonly selection: ModelSelection) {
    super();
  }

  execute(state: State): StepResult {
    const newState = cloneStateShallow(state);
    newState.selection = this.selection;
    return { state: newState };
  }
}
