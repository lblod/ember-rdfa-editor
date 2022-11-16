import State, { SayState } from '../index';
import { BaseStep, StepResult, StepType } from './step';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import { SimpleRange } from '@lblod/ember-rdfa-editor/core/model/simple-range';
import { EMPTY_MAPPER } from '@lblod/ember-rdfa-editor/core/model/range-mapper';

export default class ConfigStep implements BaseStep {
  private readonly _type: StepType = 'config-step';

  readonly key: string;

  readonly value: string | null;

  constructor(key: string, value: string | null) {
    this.value = value;
    this.key = key;
  }

  get type(): StepType {
    return this._type;
  }

  mapPosition(position: SimplePosition): SimplePosition {
    return position;
  }

  mapRange(range: SimpleRange): SimpleRange {
    return range;
  }

  getResult(initialState: State): StepResult {
    const newConfig = new Map(initialState.config);
    newConfig.set(this.key, this.value);
    const state = new SayState({
      ...initialState,
      config: newConfig,
    });
    return {
      state,
      mapper: EMPTY_MAPPER,
      timestamp: new Date(),
    };
  }
}
