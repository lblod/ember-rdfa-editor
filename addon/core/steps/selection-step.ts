import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import State, { cloneStateShallow } from '../state';
import { BaseStep, StepType } from './step';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';

export default class SelectionStep implements BaseStep {
  private readonly _type: StepType = 'selection-step';
  private readonly _resultState: State;
  readonly selection: ModelSelection;

  constructor(initialState: State, selection: ModelSelection) {
    this.selection = selection;
    const newState = cloneStateShallow(initialState);
    newState.selection = this.selection;
    this._resultState = newState;
  }

  get type(): StepType {
    return this._type;
  }

  get resultState(): State {
    return this._resultState;
  }

  mapPosition(position: ModelPosition): ModelPosition {
    return position;
  }
}
