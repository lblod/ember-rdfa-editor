import { notEmpty } from '@ember/object/computed';
import Component from '@ember/component';
import { inject } from '@ember/service';
import { later } from '@ember/runloop';

import layout from '../templates/components/rdfa-editor';
import HintsRegistry from '../utils/hints-registry';
import EventProcessor from '../utils/event-processor';
import forgivingAction from '../utils/forgiving-action';
import RdfaBackspaceHandler from '../utils/rdfa-backspace-handler';
/**
* RDFa editor component
*
* @module editor-core
* @class RdfaEditorComponent
* @extends Component
*/
export default Component.extend({
  layout,
  classNames: ["editor-grid"],

  /**
  * Plugin profile of the RDFa editor
  *
  * @property profile
  * @type string
  * @default 'default'
  *
  * @public
  */
  profile: 'default',

  /**
   * Function accepting a debug object containing the components used for debugging
   *   (e.g. hints registry, context scanner, editor)
   * @property initDebug
   * @type function
   *
   * @public
  */
  initDebug: null,

  /**
  * @property rdfaEditorDispatcher
  * @type RdfaEditorDispatcher
  *
  * @private
  */
  rdfaEditorDispatcher: inject(),

  /**
  * @property eventProcessor
  * @type EventProcessor
  *
  * @private
  */
  eventProcessor: null,

  /**
  * @property hinstRegistry
  * @type HintsRegistry
  *
  * @private
  */
  hintsRegistry: null,

  /**
  * @property hasHints
  * @type boolean
  *
  * @private
  */
  hasHints: notEmpty('hintsRegistry.registry'),

  /**
  * @property hasActiveHints
  * @type boolean
  *
  * @private
  */
  hasActiveHints: notEmpty('hintsRegistry.activeHints'),

  handlers: null,

  init() {
    this._super(...arguments);
  },

  didUpdateAttrs() {
    if (this.get('profile') != this.get('eventProcessor.profile')) {
      this.set('eventProcessor.profile', this.get('profile'));
    }
  },

  actions: {
    /**
    * Handle the removal of text in a specified region
    *
    * @method handleTextRemove
    *
    * @param {number} start Start of the text range
    * @param {number} end End of the text range
    *
    * @private
    */
    handleTextRemove(start, stop){
      this.get('eventProcessor').removeText(start, stop);
    },

    /**
    * Handle the insertion of text starting at the specified location
    *
    * @method handleTextInsert
    *
    * @param {number} start Start of the text range
    * @param {string} text Text to insert
    *
    * @private
    */
    handleTextInsert(index, text){
      this.get('eventProcessor').insertText(index, text);
    },

   /**
    * Handle the full text change
    *
    * @method handleFullContentUpdate
    *
    * @private
    */
    handleFullContentUpdate(){
      this.get('eventProcessor').analyseAndDispatch();
    },

    /**
    * Handling the change of the current selected text/location in the editor
    *
    * @method handleSelectionChange
    *
    * @private
    */
    handleSelectionChange(){
      this.get('eventProcessor').selectionChanged(this.get('rawEditor.currentSelection'));
    },

    /**
     * Handle init of rawEditor
     *
     * @method handleRawEditorInit
     *
     * @param {RawEditor} editor, the editor interface
     *
     * @private
     */
    handleRawEditorInit(editor) {
      this.set('editor', editor);
      this.set('handlers', [RdfaBackspaceHandler.create({rawEditor: editor })]);
      this.set('hintsRegistry', HintsRegistry.create());
      var eventProcessor = EventProcessor.create({
        registry: this.get('hintsRegistry'),
        profile: this.get('profile'),
        dispatcher: this.get('rdfaEditorDispatcher'),
        editor: this.get('editor')
      });
      this.set('eventProcessor', eventProcessor);
      this.get('hintsRegistry').addRegistryObserver( function(registry) {
        eventProcessor.handleRegistryChange(registry);
      });

      this.get('hintsRegistry').addNewCardObserver( function(card) {
        eventProcessor.handleNewCardInRegistry(card);
      });

      this.get('hintsRegistry').addRemovedCardObserver( function(card) {
        eventProcessor.handleRemovedCardInRegistry(card);
      });


      if (this.get('initDebug')) {
        const debugInfo = {
          hintsRegistry: this.get('hintsRegistry'),
          editor: this.get('eventProcessor.editor'),
          contextScanner: this.get('eventProcessor.scanner')
        };
        this.get('initDebug')(debugInfo);
      }
      forgivingAction('rdfaEditorInit', this)(editor);
    },

    /**
     * handles updates of the editor dom tree
     * @method handleElementUpdate
     *
     *
     * @private
     */
    handleElementUpdate(){
      forgivingAction("domUpdate", this)(this.get('editor.rootNode'));
    },

    /**
     * Highlights a node for a short time span and scrolls to it
     * @method highlightStructuredItem
     *
     * @param {DOMNode} node Node to highlight and scroll to
     */
    highlightStructureItem(node) {
      const editorOffset = this.get('editor.rootNode').offsetTop;
      node.classList.add('u-marker');
      later(this, function() {
        node.classList.remove('u-marker');
      }, 1500);
      this.get('element').scrollTo(0, node.offsetTop + editorOffset);
    }
  }
});
