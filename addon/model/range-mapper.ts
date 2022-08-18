import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';

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
