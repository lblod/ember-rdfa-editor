import {
  modelPosToSimplePos,
  SimplePosition,
  simplePosToModelPos,
} from '@lblod/ember-rdfa-editor/core/model/simple-position';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';

export interface SimpleRange {
  start: SimplePosition;
  end: SimplePosition;
}

export function simpleRangeToModelRange(
  simpleRange: SimpleRange,
  root: ModelElement
): ModelRange {
  return new ModelRange(
    simplePosToModelPos(simpleRange.start, root),
    simplePosToModelPos(simpleRange.end, root)
  );
}

export function modelRangeToSimpleRange(modelRange: ModelRange): SimpleRange {
  return {
    start: modelPosToSimplePos(modelRange.start),
    end: modelPosToSimplePos(modelRange.end),
  };
}

export function simpleRangesEqual(range1: SimpleRange, range2: SimpleRange) {
  return range1.start === range2.start && range1.end === range2.end;
}

export function isCollapsed(range: SimpleRange) {
  return range.start === range.end;
}
