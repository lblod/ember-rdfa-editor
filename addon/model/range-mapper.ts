import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';

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
}
