import { A } from '@ember/array';
import Component from '@ember/component';
import layout from '../templates/components/rdfa-context-debugger';
import { computed } from '@ember/object';
import { analyse } from '@lblod/marawa/rdfa-context-scanner';

/**
 * Debugger component for the RDFa context of DOM nodes
 *
 * @module editor-core
 * @class RdfaContextDebugger
 * @extends Component
 */
export default Component.extend({
  layout,

  /**
   * RDFa editor to debug in
   *
   * @property editor
   * @type RdfaEditor
   *
   * @public
   */
  editor: null,

  /**
   * The calculated RDFa contexts per region
   *
   * @property contexts
   * @type Ember.Array
   *
   * @private
   */
  contexts: null,

  init() {
    this._super(...arguments);
    this.set('contexts', A());
  },

  actions: {
    /**
     * Analyse the RDFa context of a specified region
     *
     * @method analyse
     *
     * @param {number} start Start of the region
     * @param {number} end End of the region
     *
     * @private
     */
    analyse(start, end) {
      const node = this.get('editor.rootNode');

      const contexts = analyse(node, [start, end]);
      this.set('contexts', contexts);
    },

    /**
     * Highlight the given region in the editor
     *
     * @method highlight
     *
     * @param {[number, number]} region Region to highlight
     *
     * @private
     */
    highlight(region){
      this.get('editor').highlightRange(region[0], region[1]);
    }
  }
});
