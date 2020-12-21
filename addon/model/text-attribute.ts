import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";

export type TextAttributeType = "bold"
type AttributeRange = [number, number];
export default class TextAttribute {
  type: TextAttributeType;
  ranges: AttributeRange[];

  constructor(type: TextAttributeType) {
    this.type = type;
    this.ranges = [];
  }

  enableIn(range: AttributeRange) {
    for(const [index, enabledRange] of this.ranges.entries()) {
      if(range[0] < enabledRange[0]) {
        if(range[1] < enabledRange[1]) {
          //no overlap
          this.ranges.splice(index,0,range);
          return;
        } else {
          //partial overlap
          enabledRange[0] = range[0];
        }

      } else if(range[0] <= enabledRange[1]) {
        if(range[1] > enabledRange[1]) {
          // partial overlap
          enabledRange[1] = range[1];
          return;
        } else {
          // range is fully contained, nothing to do
          return;
        }
      }
      // range starts after this range, so check the next one

    }
    // we've checked all ranges and it turns out we start after the last range
    this.ranges.push(range);
  }

  disableIn(range: AttributeRange) {
    throw new NotImplementedError();
  }

}
