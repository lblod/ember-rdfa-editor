import {
  OperationStep,
  OperationStepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import {
  isCollapsed,
  SimpleRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import State, { cloneStateInRange } from '@lblod/ember-rdfa-editor/core/state';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import { SimpleRangeMapper } from '@lblod/ember-rdfa-editor/core/model/range-mapper';

interface Args {
  range: SimpleRange;
  splitParent?: boolean;
}

/**
 * @deprecated try to use {@link ReplaceStep}
 */
export default class SplitStep implements OperationStep {
  readonly type: StepType = 'split-step';

  private readonly args: Args;

  constructor(args: Args) {
    const { range, splitParent = true } = args;
    this.args = { range, splitParent };
  }

  getResult(initialState: State): OperationStepResult {
    const { range } = this.args;
    const resultState = cloneStateInRange(range, initialState);
    const root = resultState.document;

    if (isCollapsed(range)) {
      const { position, mapper } = this.doSplit(root, range.start);
      resultState.selection = mapper.mapSelection(
        initialState.selection,
        resultState.document
      );
      return {
        state: resultState,
        defaultRange: { start: position, end: position },
        mapper,
        timestamp: new Date(),
      };
    } else {
      const { position: end, mapper: endMapper } = this.doSplit(
        root,
        range.end
      );
      const { position: start, mapper: startMapper } = this.doSplit(
        root,
        endMapper.mapPosition(range.start)
      );
      const mapper = endMapper.appendMapper(startMapper);
      resultState.selection = mapper.mapSelection(
        initialState.selection,
        resultState.document
      );
      return {
        state: resultState,
        defaultRange: { start: start, end: startMapper.mapPosition(end) },
        mapper,
        timestamp: new Date(),
      };
    }
  }

  private doSplit(
    root: ModelElement,
    position: SimplePosition
  ): { position: SimplePosition; mapper: SimpleRangeMapper } {
    if (this.args.splitParent) {
      return OperationAlgorithms.split(root, position);
    } else {
      return OperationAlgorithms.splitText(root, position);
    }
  }
}
