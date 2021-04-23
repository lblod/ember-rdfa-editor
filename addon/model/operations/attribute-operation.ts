import ModelRange from "../model-range";
import Operation from "@lblod/ember-rdfa-editor/model/operations/operation";
import {UnconfinedRangeError} from "@lblod/ember-rdfa-editor/utils/errors";

export default class AttributeOperation extends Operation {

  private _key: string;
  private _value: string;

  constructor(range: ModelRange, key: string, value: string) {
    super(range);
    this._key = key;
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
  }

  get key(): string {
    return this._key;
  }

  set key(value: string) {
    this._key = value;
  }

  canExecute() {
    return !this.range.isConfined();
  }

  execute(): ModelRange {

    if(!this.canExecute()) {
      throw new UnconfinedRangeError();
    }

    // TODO: replace with treewalker
    for (const node of this.range.start.parent.children) {
      node.setAttribute(this._key, this._value);
    }
    return this.range;

  }
}
