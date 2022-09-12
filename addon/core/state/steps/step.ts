import State from '../index';
import ConfigStep from './config-step';
import OperationStep from './operation-step';
import SelectionStep from './selection-step';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { LeftOrRight } from '@lblod/ember-rdfa-editor/model/range-mapper';

export interface BaseStep {
  readonly type: StepType;
  readonly resultState: State;

  mapPosition(position: ModelPosition, bias?: LeftOrRight): ModelPosition;

  mapRange(range: ModelRange, bias?: LeftOrRight): ModelRange;
}

export type StepType = 'operation-step' | 'selection-step' | 'config-step';

export type Step = SelectionStep | OperationStep | ConfigStep;

export function isSelectionStep(step: Step): step is SelectionStep {
  return step.type === 'selection-step';
}

export function isConfigStep(step: Step): step is ConfigStep {
  return step.type === 'config-step';
}

export function isOperationStep(step: Step): step is OperationStep {
  return step.type === 'operation-step';
}

export type StepResult = {
  state: State;
};
