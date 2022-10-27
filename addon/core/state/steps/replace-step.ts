import {
  OperationStep,
  OperationStepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import State, { cloneStateInRange } from '@lblod/ember-rdfa-editor/core/state';
import {
  modelRangeToSimpleRange,
  SimpleRange,
  simpleRangeToModelRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import { LeftOrRight } from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import InsertOperation from '@lblod/ember-rdfa-editor/core/model/operations/insert-operation';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';

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
    const op = new InsertOperation(
      resultState.document,
      undefined,
      simpleRangeToModelRange(this.range, resultState.document),
      ...this.nodes
    );
    const { defaultRange } = op.execute();
    return {
      state: resultState,
      defaultRange: modelRangeToSimpleRange(defaultRange),
    };
  }

  mapPosition(position: SimplePosition, _bias?: LeftOrRight): SimplePosition {
    return position;
  }

  mapRange(range: SimpleRange, _bias?: LeftOrRight): SimpleRange {
    return range;
  }
}

