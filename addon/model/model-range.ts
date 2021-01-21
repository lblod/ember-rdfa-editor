import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

/**
 * Model-space equivalent of a {@link Range}
 * Not much more than a container for two {@link ModelPosition ModelPositions}
 */
export default class ModelRange {
  private _start: ModelPosition;
  private _end: ModelPosition;

  constructor(start: ModelPosition, end: ModelPosition = start) {
    this._start = start;
    this._end = end;
  }

  /**
   * start, aka leftmost position of the range
   */
  get start(): ModelPosition {
    return this._start;
  }

  set start(value: ModelPosition) {
    this._start = value;
  }

  /**
   * end, aka rightmost position of the range
   */
  get end(): ModelPosition {
    return this._end;
  }

  set end(value: ModelPosition) {
    this._end = value;
  }

  /**
   * whether start and end positions are the same
   */
  get collapsed(): boolean {
    return this.start.sameAs(this.end);
  }

  /**
   * Find the common ancestor of start and end positions.
   */
  getCommonAncestor(): ModelPosition | null {
    if(this.start.root !== this.end.root) {
      return null;
    }
    return ModelPosition.getCommonAncestor(this.start, this.end);

  }

}
