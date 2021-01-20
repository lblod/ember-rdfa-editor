import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";

export default class ModelRange {
  private _start: ModelPosition;
  private _end: ModelPosition;

  constructor(start: ModelPosition, end: ModelPosition = start) {
    this._start = start;
    this._end = end;
  }

  get end(): ModelPosition {
    return this._end;
  }

  set end(value: ModelPosition) {
    this._end = value;
  }

  get start(): ModelPosition {
    return this._start;
  }

  set start(value: ModelPosition) {
    this._start = value;
  }

  get collapsed(): boolean {
    return this.start.sameAs(this.end);
  }
}
