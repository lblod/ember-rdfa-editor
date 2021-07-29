import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

export interface SimplifiedModel {
  rootModelNode: ModelElement,
  modelSelection: ModelSelection
}

export default class ModelHistory {
  maxSize: number;
  history: SimplifiedModel[] = [];

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  push(model: SimplifiedModel): void {
    if (this.history.length === this.maxSize) {
      // Remove first model in the history.
      this.history.shift();
    }
    this.history.push(model);
  }

  pop(): SimplifiedModel | undefined {
    return this.history.pop();
  }
}
