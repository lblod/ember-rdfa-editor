import { A } from '@ember/array';
import Component from '@ember/component';
import layout from '../templates/components/rdfa-context-debugger';
import { analyse } from '@lblod/marawa/rdfa-context-scanner';
import { debug } from '@ember/debug';

/**
 * Debugger component for the RDFa context of DOM nodes
 *
 * @module rdfa-editor
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

  blocks: null,
  selections: null,
  selectOptions: null,

  scanStart: 0,
  scanEnd: 1000,
  selectStart: 0,
  selectEnd: 1000,
  selectScopes: Object.freeze(['auto', 'inner', 'outer']),

  init() {
    this._super(...arguments);
    this.resetResults();
    this.set('selectOptions', { scope: 'inner' });
  },

  resetResults() {
    this.set('blocks', A());
    this.set('selections', A());
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
      this.resetResults();
      const node = this.get('editor.rootNode');

      const blocks = analyse(node, [start, end]);
      debug('Finished calculating blocks');
      this.set('blocks', blocks);
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
    },

    selectContext(start, end, options) {
      this.resetResults();

      const splitValues = function(stringValue) {
        return (stringValue || "").split('\n').map(s => s.trim()).filter(s => s.length);
      };

      options.typeof = splitValues(options.typeofString);
      options.property = splitValues(options.propertyString);

      const selections = this.editor.selectContext([start, end], options);
      debug('Finished selecting contexts');
      this.set('selections', selections);
    }
  }
});
