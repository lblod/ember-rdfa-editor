import Component from '@ember/component';
import layout from '../templates/components/editor-suggested-hints';
import { A } from '@ember/array';
export default Component.extend({
  layout,
  click() {
    this.set('suggestedHints', A());
  }
});
