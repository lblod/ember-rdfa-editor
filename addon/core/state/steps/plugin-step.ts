import State, { SayState } from '../index';
import { BaseStep, StepType } from './step';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { ResolvedPluginConfig } from '@lblod/ember-rdfa-editor/components/rdfa/rdfa-editor';
import { View } from '../../view';

export default class PluginStep implements BaseStep {
  private readonly _type: StepType = 'plugin-step';

  private _resultState: State;

  readonly configs: ResolvedPluginConfig[] = [];

  readonly view: View;

  constructor(
    initialState: State,
    configs: ResolvedPluginConfig[],
    view: View
  ) {
    this.configs = configs;
    this.view = view;
    const plugins = this.configs.map((config) => config.instance);
    this._resultState = new SayState({
      ...initialState,
      plugins,
      widgetMap: new Map(),
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
