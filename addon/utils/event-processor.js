import { warn, assert } from '@ember/debug';
import EmberObject from '@ember/object';
import RdfaContextScanner from '../utils/rdfa-context-scanner';
import HintsRegistry from '../utils/hints-registry';
import { A } from '@ember/array';

/**
* Event processor orchastrating the hinting based on incoming editor events
*
* @module editor-core
* @class EventProcessor
* @constructor
* @extends EmberObject
*/
export default EmberObject.extend({
  /**
   * @property registry
   * @type HintsRegistry
   */
  registry: null,

  cardsLocationFlaggedRemoved: null,

  cardsLocationFlaggedNew: null,

  /**
   * @property scanner
   * @type RdfaContextScanner
   */
  scanner: null,

  /**
   * @property editor
   * @type RdfaEditor
   */
  editor: null,

  /**
   * @property profile
   * @type string
   */
  profile: null,

  /**
   * @property dispatcher
   * @type EditorDispatcher
   */
  dispatcher: null,

  init() {
    this._super(...arguments);
    this.set('cardsLocationFlaggedRemoved', A());
    this.set('cardsLocationFlaggedNew', A());

    if (! this.get('registry')) {
      this.set('registry', HintsRegistry.create());
    }
    if (! this.get('scanner')) {
      this.set('scanner', RdfaContextScanner.create());
    }
    if (! this.get('profile')) {
      this.set('profile', 'default');
    }

    assert(this.get('dispatcher'), "dispatcher should be set");
    assert(this.get('editor'), "editor should be set");
  },

  /**
   * Observer of the registry updating the highlighted hints in the editor
   *
   * @method handleRegistryChange
   *
   * @param {Ember.Array} registry
   * @public
   */
  handleRegistryChange(/*registry*/) {
    const editor = this.get('editor');
    editor.clearHighlightForLocations(this.get('cardsLocationFlaggedRemoved'));

    this.get('cardsLocationFlaggedNew').forEach(location => {
      editor.highlightRange(location[0], location[1]);
    });

    this.set('cardsLocationFlaggedRemoved', A());
    this.set('cardsLocationFlaggedNew', A());
  },

  handleNewCardInRegistry(card){
    if( !card.options || !card.options.noHighlight ) {
      this.get('cardsLocationFlaggedNew').push(card.location);
    }
  },

  handleRemovedCardInRegistry(card){
    if( !card.options || !card.options.noHighlight ) {
      this.get('cardsLocationFlaggedRemoved').push(card.location);
    }
  },


  /**
   * Analyses the RDFa context and trigger hint updates through the editor dispatcher
   * based on the RDFa context and the current text in the editor
   *
   * @method analyseAndDispatch
   *
   * @public
   */
  analyseAndDispatch(){
    const rootNode = this.get('editor.rootNode');
    const currentNode = this.get('editor.currentNode');

    if (!currentNode) {
      warn('Current node not set. Cannot analyse and dispatch event.', { id: 'rdfaeditor.state-error' });
      return;
    }

    const currentRichNode = this.get('editor').getRichNodeFor(currentNode);
    if (currentRichNode) {
      const contexts = this.get('scanner').analyse(rootNode, [currentRichNode.start, currentRichNode.end]);
      this.get('dispatcher').dispatch(this.get('profile'), this.get('registry').currentIndex(), contexts, this.get('registry'), this.get('editor'));
    }
  },

  /**
   * Remove text in the specified range and trigger updating of the hints
   *
   * @method removeText
   *
   * @param {number} start Start of the text range
   * @param {number} end End of the text range
   *
   * @public
   */
  removeText(start, stop) {
    this.get('registry').removeText(start, stop);
  },

  /**
   * Insert text starting at the specified location and trigger updating of the hints
   *
   * @method insertText
   *
   * @param {number} start Start of the text range
   * @param {string} text Text to insert
   *
   * @public
   */
  insertText(index, text) {
    this.get('registry').insertText(index, text);
  },

  /**
   * Handling the change of the current selected text/location in the editor
   *
   * @method selectionChanged
   *
   * @public
   */
  selectionChanged() {
    this.get('registry').set('activeRegion', this.get('editor.currentSelection'));
  }
});
