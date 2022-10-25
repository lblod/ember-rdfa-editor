import Operation from '@lblod/ember-rdfa-editor/core/model/operations/operation';
import State from '../index';
import { BaseStep, StepResult, StepType } from './step';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import { OperationError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import RangeMapper, {
  LeftOrRight,
} from '@lblod/ember-rdfa-editor/core/model/range-mapper';

export default class OperationStep implements BaseStep {
  private readonly _type: StepType = 'operation-step';
  private readonly _resultState: State;
  private readonly _defaultRange: ModelRange;
  private readonly mapper: RangeMapper;

  constructor(initialState: State, readonly operation: Operation) {
    if (initialState.document !== operation.range.root) {
      throw new OperationError();
    }
    const { mapper, defaultRange } = this.operation.execute();
    this.mapper = mapper;
    this._defaultRange = defaultRange;
    initialState.selection = this.mapper.mapSelection(initialState.selection);
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

  mapPosition(
    position: ModelPosition,
    bias: LeftOrRight = 'right'
  ): ModelPosition {
    return this.mapper.mapPosition(position, bias);
  }

  mapRange(range: ModelRange, bias: LeftOrRight = 'right'): ModelRange {
    return this.mapper.mapRange(range, bias);
  }

  getResult(): StepResult {
    return { state: this.resultState };
  }
}
