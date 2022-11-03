import {
  BaseStep,
  StepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import {
  EMPTY_MAPPER,
  LeftOrRight,
} from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import { SimpleRange } from '@lblod/ember-rdfa-editor/core/model/simple-range';
import State from '@lblod/ember-rdfa-editor/core/state';

interface Args {
  manip: (state: State) => State;
}

/**
 * Generic step to perform any state changes not covered by other steps
 */
export default class StateStep implements BaseStep {
  readonly type: StepType = 'state-step';
  private manip: (state: State) => State;

  constructor({ manip }: Args) {
    this.manip = manip;
  }

  getResult(initialState: State): StepResult {
    const result = this.manip(initialState);
    return { state: result, mapper: EMPTY_MAPPER };
  }

  mapPosition(position: SimplePosition, bias?: LeftOrRight): SimplePosition {
    return position;
  }

  mapRange(range: SimpleRange, bias?: LeftOrRight): SimpleRange {
    return range;
  }
}
