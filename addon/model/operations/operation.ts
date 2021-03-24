import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

export default abstract class Operation {
  private _range: ModelRange;
  protected constructor(range: ModelRange) {
    this._range = range;
  }
  get range(): ModelRange {
    return this._range;
  }

  set range(value: ModelRange) {
    this._range = value;
  }
  abstract execute(): ModelRange;
}
