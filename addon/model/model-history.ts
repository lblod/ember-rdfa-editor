import SimplifiedModel from '@lblod/ember-rdfa-editor/model/simplified-model';

export default class ModelHistory {
  maxSize: number;
  history: SimplifiedModel[] = [];

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  push(model: SimplifiedModel): void {
    // Last snapshot in history equals new snapshot we want to add, so don't store new snapshot.
    if (
      this.history.length > 0 &&
      model.sameAs(this.history[this.history.length - 1])
    ) {
      return;
    }

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
