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
  root: ModelElement,
  useSizeCache = true
): ModelRange {
  return new ModelRange(
    simplePosToModelPos(simpleRange.start, root, useSizeCache),
    simplePosToModelPos(simpleRange.end, root, useSizeCache)
  );
}

export function modelRangeToSimpleRange(
  modelRange: ModelRange,
  useSizeCache = true
): SimpleRange {
  return {
    start: modelPosToSimplePos(modelRange.start, useSizeCache),
    end: modelPosToSimplePos(modelRange.end, useSizeCache),
  };
}

export function simpleRangesEqual(range1: SimpleRange, range2: SimpleRange) {
  return range1.start === range2.start && range1.end === range2.end;
}

export function rangeContains(
  range1: SimpleRange,
  range2: SimpleRange,
  {
    strictStart = false,
    strictEnd = false,
  }: { strictStart?: boolean; strictEnd?: boolean } = {}
) {
  const start2AfterStart1 = strictStart
    ? range2.start > range1.start
    : range2.start >= range1.start;
  const end2BeforeEnd1 = strictEnd
    ? range2.end < range1.end
    : range2.end <= range1.end;
  return start2AfterStart1 && end2BeforeEnd1;
}

export function positionInRange(
  position: SimplePosition,
  range: SimpleRange,
  {
    strictStart = false,
    strictEnd = false,
  }: { strictStart?: boolean; strictEnd?: boolean } = {}
) {
  const afterStart = strictStart
    ? position > range.start
    : position >= range.start;
  const beforeEnd = strictEnd ? position < range.end : position <= range.end;
  return afterStart && beforeEnd;
}

export function isCollapsed(range: SimpleRange) {
  return range.start === range.end;
}
