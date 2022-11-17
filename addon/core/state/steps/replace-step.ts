import {
  OperationStep,
  OperationStepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import State, { cloneStateInRange } from '@lblod/ember-rdfa-editor/core/state';
import { SimpleRange } from '@lblod/ember-rdfa-editor/core/model/simple-range';
import {
  LeftOrRight,
  SimpleRangeMapper,
} from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';

export interface ReplaceStepArgs {
  range: SimpleRange;
  nodes?: ModelNode[];
}

export default class ReplaceStep implements OperationStep {
  private readonly _type: StepType = 'replace-step';
  private range: SimpleRange;
  private nodes: ModelNode[];

  constructor({ range, nodes = [] }: ReplaceStepArgs) {
    this.range = range;
    this.nodes = nodes;
  }

  get type() {
    return this._type;
  }

  getResult(initialState: State): OperationStepResult {
    const resultState = cloneStateInRange(this.range, initialState);
    let mapper: SimpleRangeMapper;
    if (!this.nodes.length) {
      mapper = OperationAlgorithms.remove(
        resultState.document,
        this.range
      ).mapper;
    } else {
      mapper = OperationAlgorithms.insert(
        resultState.document,
        this.range,
        ...this.nodes
      ).mapper;
    }
    resultState.selection = mapper.mapSelection(
      initialState.selection,
      resultState.document
    );
    return {
      state: resultState,
      defaultRange: mapper.mapRange(this.range),
      mapper,
      timestamp: new Date(),
    };
  }

  mapPosition(position: SimplePosition, _bias?: LeftOrRight): SimplePosition {
    return position;
  }

  mapRange(range: SimpleRange, _bias?: LeftOrRight): SimpleRange {
    return range;
  }
}
