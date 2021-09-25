/**
 * A simple capped collection to store document snapshots.
 *
 * @module contenteditable-editor
 * @class CappedHistory
 * @constructor
 */
export interface Document {
  content: string;
  currentSelection: number[];
}

export default class CappedHistory {
  maxItems;
  history: Document[] = [];

  constructor({maxItems = 10}: {maxItems: number}) {
    this.maxItems = maxItems;
  }

  push(document: Document) {
    if (this.history.length > 0 && this.history[this.history.length - 1] === document) {
      return;
    }

    if (this.history.length === this.maxItems) {
      this.history.shift();
    }

    this.history.push(document);
  }

  pop(): Document | undefined {
    return this.history.pop();
  }
}
