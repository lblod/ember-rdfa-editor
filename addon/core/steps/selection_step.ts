import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import State, { SayState } from '../state';
import Step, { StepResult, StepType } from './step';

export default class SelectionStep extends Step {
  type: StepType = 'selection-step';

  constructor(readonly ranges: ModelRange[]) {
    super();
  }
  execute(state: State): StepResult {
    const selection = new ModelSelection();
    selection.selectRanges(...this.ranges);
    const newState = new SayState({
      ...state,
      selection,
    });
    return { state: newState };
  }
}
