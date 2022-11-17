import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';
import {
  modelRangeToSimpleRange,
  SimpleRange,
  simpleRangeToModelRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import ModelElement from './nodes/model-element';

export type LeftOrRight = 'left' | 'right';
export type PositionMapping = (
  position: ModelPosition,
  bias?: LeftOrRight
) => ModelPosition;
export default class RangeMapper {
  private mappings: PositionMapping[];

  constructor(mappings: PositionMapping[] = []) {
    this.mappings = mappings;
  }

  mapPosition(position: ModelPosition, bias?: LeftOrRight): ModelPosition {
    let current = position;
    for (const mapping of this.mappings) {
      current = mapping(current, bias);
    }
    return current;
  }

  mapRange(range: ModelRange, bias: LeftOrRight = 'right'): ModelRange {
    if (range.collapsed) {
      const newPos = this.mapPosition(range.start, bias);
      return new ModelRange(newPos, newPos);
    }
    const newStart = this.mapPosition(range.start, 'left');
    const newEnd = this.mapPosition(range.end, bias);
    return new ModelRange(newStart, newEnd);
  }

  mapSelection(
    selection: ModelSelection,
    bias: LeftOrRight = 'right'
  ): ModelSelection {
    const newSelection = selection.clone();
    newSelection.ranges = newSelection.ranges.map((range) =>
      this.mapRange(range, bias)
    );
    newSelection.isRightToLeft = selection.isRightToLeft;
    return newSelection;
  }

  appendMapper(mapper: RangeMapper): this {
    this.mappings.push(...mapper.mappings);
    return this;
  }
}
export type SimplePositionMapping = (
  position: SimplePosition,
  bias?: LeftOrRight
) => SimplePosition;

export interface RangeMapConfig {
  startBias?: LeftOrRight;
  endBias?: LeftOrRight;
}

export interface PositionMapConfig {
  bias?: LeftOrRight;
}

export class SimpleRangeMapper {
  private mappings: SimplePositionMapping[];

  constructor(mappings: SimplePositionMapping[] = []) {
    this.mappings = mappings;
  }

  mapPosition(
    position: SimplePosition,
    { bias }: PositionMapConfig = {}
  ): SimplePosition {
    let current = position;
    for (const mapping of this.mappings) {
      current = mapping(current, bias);
    }
    return current;
  }

  mapRange(
    range: SimpleRange,
    { startBias, endBias }: RangeMapConfig = {}
  ): SimpleRange {
    if (range.start === range.end) {
      const newPos = this.mapPosition(range.start, { bias: startBias });
      return { start: newPos, end: newPos };
    }
    const newStart = this.mapPosition(range.start, { bias: startBias });
    const newEnd = this.mapPosition(range.end, { bias: endBias });
    return { start: newStart, end: newEnd };
  }

  mapSelection(
    modelSelection: ModelSelection,
    newRoot: ModelElement
  ): ModelSelection {
    const mappedSelectionRanges = modelSelection.ranges
      .map((modelRange) => modelRangeToSimpleRange(modelRange))
      .map((simpleRange) => this.mapRange(simpleRange))
      .map((simpleRange) => simpleRangeToModelRange(simpleRange, newRoot));
    const mappedSelection = modelSelection.clone();
    mappedSelection.ranges = mappedSelectionRanges;
    return mappedSelection;
  }

  appendMapper(mapper: SimpleRangeMapper): this {
    this.mappings.push(...mapper.mappings);
    return this;
  }
}

export const EMPTY_MAPPER = new SimpleRangeMapper([]);
