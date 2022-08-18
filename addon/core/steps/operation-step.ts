import Operation from '@lblod/ember-rdfa-editor/model/operations/operation';
import State from '../state';
import { BaseStep, StepType } from './step';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import RangeMapper from '@lblod/ember-rdfa-editor/model/range-mapper';

export default class OperationStep implements BaseStep {
  private readonly _type: StepType = 'operation-step';
  private readonly _resultState: State;
  private readonly _defaultRange: ModelRange;
  private readonly mapper: RangeMapper;

  constructor(initialState: State, readonly operation: Operation) {
    const { mapper, defaultRange } = this.operation.execute();
    this.mapper = mapper;
    this._defaultRange = defaultRange;
    this._resultState = initialState;
  }

  get type(): StepType {
    return this._type;
  }

  get defaultRange(): ModelRange {
    return this._defaultRange;
  }

  get resultState(): State {
    return this._resultState;
  }

  mapPosition(position: ModelPosition): ModelPosition {
    throw new NotImplementedError();
  }
}
