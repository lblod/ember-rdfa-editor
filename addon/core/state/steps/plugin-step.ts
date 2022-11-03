import State, { SayState } from '../index';
import { BaseStep, StepResult, StepType } from './step';
import { ResolvedPluginConfig } from '@lblod/ember-rdfa-editor/components/rdfa/rdfa-editor';
import { View } from '../../view';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import { SimpleRange } from '@lblod/ember-rdfa-editor/core/model/simple-range';
import {EMPTY_MAPPER} from "@lblod/ember-rdfa-editor/core/model/range-mapper";

export default class PluginStep implements BaseStep {
  private readonly _type: StepType = 'plugin-step';

  readonly configs: ResolvedPluginConfig[] = [];

  readonly view: View;

  constructor(configs: ResolvedPluginConfig[], view: View) {
    this.configs = configs;
    this.view = view;
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
    const plugins = this.configs.map((config) => config.instance);
    const resultState = new SayState({
      ...initialState,
      plugins,
      widgetMap: new Map(),
    });
    return { state: resultState ,mapper: EMPTY_MAPPER };
  }
}
