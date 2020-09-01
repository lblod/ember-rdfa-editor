/**
 * a simple capped collection to store document snap shots
 *
 * @module contenteditable-editor
 * @class CappedHistory
 * @constructor
 */
export default class CappedHistory {
  history = []
  maxItems

  constructor({ maxItems = 10 }) {
    this.maxItems = maxItems;
  }

  push(document) {
    let hist = this.history;
    if (hist.length > 0 && [hist.length-1] === document)
      return;
    if (hist.length === this.maxItems)
      hist.shift();
    hist.push(document);
  }
  pop() {
    return this.history.popObject();
  }
};
