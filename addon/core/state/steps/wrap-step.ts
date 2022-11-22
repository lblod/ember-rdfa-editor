import {
  OperationStep,
  OperationStepResult,
  StepType,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import State, { cloneStateInRange } from '@lblod/ember-rdfa-editor/core/state';
import {
  rangeContains,
  SimpleRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import OperationAlgorithms from '@lblod/ember-rdfa-editor/core/model/operations/operation-algorithms';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import {
  SimplePositionMapping,
  SimpleRangeMapper,
} from '@lblod/ember-rdfa-editor/core/model/range-mapper';
import { IllegalArgumentError } from '@lblod/ember-rdfa-editor/utils/errors';

export interface WrapStepArgs {
  /**
   * Range to be replaced
   */
  replaceRange: SimpleRange;
  /**
   * Range inside the replaceRange that will be preserved. This must be a range that
   * fully fits inside the replaceRange (it may also be equal).
   */
  preserveRange: SimpleRange;
  /**
   * The subtree the replaceRange will be replaced with. If omitted, the replaceRange
   * will be overwritten with the content of the preserveRange
   */
  wrappingElement?: ModelElement;
  /**
   * position inside the wrappingElement the preserved content will be inserted
   * this is a position relative to the wrappingElement, aka position 0
   * is just before the first child of the wrappingElement
   *
   * Defaults to 0 if omitted. If no wrappingElement is given, this is ignored.
   */
  insertPosition?: SimplePosition;
}

export default class WrapStep implements OperationStep {
  readonly type: StepType = 'wrap-step';
  private args: WrapStepArgs;

  constructor(args: WrapStepArgs) {
    this.args = args;
    const { replaceRange, preserveRange } = args;
    if (!rangeContains(replaceRange, preserveRange)) {
      throw new IllegalArgumentError(
        'preserveRange must be inside replaceRange'
      );
    }
  }

  getResult(initialState: State): OperationStepResult {
    const {
      replaceRange,
      preserveRange,
      wrappingElement,
      insertPosition = 0,
    } = this.args;
    const resultState = cloneStateInRange(replaceRange, initialState);
    const { removedNodes: preservedNodes, mapper: deleteMapper } =
      OperationAlgorithms.remove(resultState.document, preserveRange);
    if (wrappingElement) {
      OperationAlgorithms.insert(
        wrappingElement,
        { start: insertPosition, end: insertPosition },
        ...preservedNodes
      );
      const result = OperationAlgorithms.insert(
        resultState.document,
        deleteMapper.mapRange(replaceRange),
        wrappingElement
      );
      const insertSize = wrappingElement.getSize(true);
      const mapper = new SimpleRangeMapper([
        buildWrapMapper(
          replaceRange,
          insertSize,
          preserveRange,
          insertPosition
        ),
      ]);
      return {
        state: resultState,
        timestamp: new Date(),
        mapper,
        defaultRange: mapper.mapRange(replaceRange),
        removedNodes: result.overwrittenNodes,
      };
    } else {
      const result = OperationAlgorithms.insert(
        resultState.document,
        deleteMapper.mapRange(replaceRange),
        ...preservedNodes
      );
      const mapper = new SimpleRangeMapper([
        buildEmptyWrapMapper(replaceRange, preserveRange),
      ]);
      return {
        state: resultState,
        timestamp: new Date(),
        mapper: mapper,
        defaultRange: mapper.mapRange(replaceRange),
        removedNodes: result.overwrittenNodes,
      };
    }
  }
}

function buildWrapMapper(
  replaceRange: SimpleRange,
  insertSize: number,
  preserveRange: SimpleRange,
  insertPos: SimplePosition
): SimplePositionMapping {
  return function (position: SimplePosition): SimplePosition {
    const replacedSize = replaceRange.end - replaceRange.start;
    const insertedPos =
      replaceRange.start +
      (preserveRange.start - replaceRange.start) +
      insertPos;
    if (position <= replaceRange.start) {
      return position;
    } else if (position >= replaceRange.end) {
      return position + insertSize - replacedSize;
    } else if (position < preserveRange.start) {
      return replaceRange.start;
    } else if (position > preserveRange.end) {
      return replaceRange.end + insertSize - replacedSize;
    } else {
      return insertedPos + (position - preserveRange.start);
    }
  };
}

function buildEmptyWrapMapper(
  replaceRange: SimpleRange,
  preserveRange: SimpleRange
): SimplePositionMapping {
  return function (position, bias): SimplePosition {
    const startGap = preserveRange.start - replaceRange.start;
    const endGap = replaceRange.end - preserveRange.end;
    if (position <= replaceRange.start) {
      return position;
    } else if (position <= preserveRange.start) {
      return replaceRange.start;
    } else if (position <= preserveRange.end) {
      return position - startGap;
    } else if (position <= replaceRange.end) {
      return position - startGap - (position - preserveRange.end);
    } else {
      return position - startGap - endGap;
    }
  };
}
