import Component from '@ember/component';
import layout from '../templates/components/editor-suggested-hints';
import { A } from '@ember/array';
/**
 * @module rdfa-editor
 * @class RdfaEditorSuggestedHintsComponent
 */
export default Component.extend({
  layout,
  actions: {
    /**
     * @method closeHints
     */
    closeHints() {
      this.set('suggestedHints', A());
    }
  }
});
