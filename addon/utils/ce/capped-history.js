import EmberObject from '@ember/object';
import { A } from '@ember/array';
/**
 * a simple capped collection to store document snap shots
 *
 * @module contenteditable-editor
 * @class CappedHistory
 * @constructor
 * @extends EmberObject
 */
const CappedHistory = EmberObject.extend({
  history: null,
  maxItems: 10,
  init() {
    this._super(...arguments);
    this.set('history', A());
  },
  push(document) {
    let hist = this.history;
    if (hist.firstObject === document)
      return;
    if (hist.length ===  this.maxItems)
      hist.shift();
    hist.pushObject(document);
  },
  pop() {
    return this.history.popObject();
  }
});
export default CappedHistory;
