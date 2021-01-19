import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";
import arrayEquals from "../utils/array-equals";

export default class ModelPosition {
  private _path: number[];
  private _root: ModelElement;

  constructor(root: ModelElement) {
    this._root = root;
    this._path = [];
  }

  static from(root: ModelElement, path: number[]) {
    const result = new ModelPosition(root);
    result.path = path;
    return result;
  }

  static fromParent(root: ModelElement, parent: ModelNode, offset: number) {


  }

  get path(): number[] {
    return this._path;
  }

  set path(value: number[]) {
    this._path = value;
  }

  get parent(): ModelNode {
    throw new NotImplementedError();
  }

  get root(): ModelElement {
    return this._root;
  }

  sameAs(other: ModelPosition): boolean {
    return this.root === other.root && arrayEquals(this.path, other.path);
  }

}
