import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import State, { cloneStateShallow } from '../index';
import { BaseStep, StepResult, StepType } from './step';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import { SimpleRange } from '@lblod/ember-rdfa-editor/core/model/simple-range';
import { AssertionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { EMPTY_MAPPER } from '@lblod/ember-rdfa-editor/core/model/range-mapper';

export default class SelectionStep implements BaseStep {
  private readonly _type: StepType = 'selection-step';
  readonly selection: ModelSelection;

  constructor(selection: ModelSelection) {
    this.selection = selection;
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
    const newState = cloneStateShallow(initialState);
    const root = this.selection.lastRange?.root;
    if (root && root !== newState.document) {
      throw new AssertionError(
        'Trying to set a selection on a state where the selection range is not in the same document as the state document'
      );
    }

    newState.selection = this.selection;
    return { state: newState, mapper: EMPTY_MAPPER, timestamp: new Date() };
  }
}
