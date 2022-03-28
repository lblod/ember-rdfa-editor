import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

export type LeftOrRight = 'left' | 'right';
export type RangeMapping = (
  range: ModelRange,
  bias?: LeftOrRight
) => ModelRange;
export default class RangeMapper {
  private mappings: RangeMapping[];

  constructor(mappings: RangeMapping[] = []) {
    this.mappings = mappings;
  }
}
