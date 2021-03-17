import ModelRange from "../model-range";
import Operation from "@lblod/ember-rdfa-editor/model/operations/operation";
import {UnconfinedRangeError} from "@lblod/ember-rdfa-editor/utils/errors";
import NodeFinder from "@lblod/ember-rdfa-editor/model/util/node-finder";
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";

export default class AttributeOperation implements Operation {

  private range: ModelRange;
  private key: string;
  private value: string;

  constructor(range: ModelRange, key: string, value: string) {
    this.range = range;
    this.key = key;
    this.value = value;
  }

  canExecute() {
    if (!this.range.isConfined()) {
      throw new UnconfinedRangeError();
    }
  }

  execute() {

    this.canExecute();

    // TODO: replace with treewalker
    for (const node of this.range.start.parent.children) {
      node.setAttribute(this.key, this.value);
    }

  }
}
