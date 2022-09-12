import State, { SayState } from '../index';
import { BaseStep, StepType } from './step';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

export default class ConfigStep implements BaseStep {
  private readonly _type: StepType = 'config-step';

  private readonly _resultState: State;

  readonly key: string;

  readonly value: string | null;

  constructor(initialState: State, key: string, value: string | null) {
    this.value = value;
    this.key = key;
    const newConfig = new Map(initialState.config);
    newConfig.set(this.key, this.value);
    this._resultState = new SayState({
      ...initialState,
      config: newConfig,
    });
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

  mapRange(range: ModelRange): ModelRange {
    return range;
  }
}
