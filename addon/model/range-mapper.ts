import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

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
    const newEnd = this.mapPosition(range.end);
    return new ModelRange(newStart, newEnd);
  }

  appendMapper(mapper: RangeMapper) {
    this.mappings.push(...mapper.mappings);
  }
}
