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
    start: modelPosToSimplePos(modelRange.root, modelRange.start),
    end: modelPosToSimplePos(modelRange.root, modelRange.end),
  };
}
