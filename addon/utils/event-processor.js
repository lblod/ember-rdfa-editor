import { assert } from '@ember/debug';
import EmberObject from '@ember/object';
import { analyse } from '@lblod/marawa/rdfa-context-scanner';
import HintsRegistry from '../utils/hints-registry';
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import scoped from '../utils/scoped-method';

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
   * this is the range spanning all text inserts as recorded between two dispatchAndAnalyse calls
   *
   * @property modifiedRange
   * @type Array
   */
  modifiedRange: null,

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
    this.set('modifiedRange', A());

    if (! this.get('registry')) {
      this.set('registry', HintsRegistry.create());
    }
    if (! this.get('profile')) {
      this.set('profile', 'default');
    }

    assert(this.get('dispatcher'), "dispatcher should be set");
    assert(this.get('editor'), "editor should be set");
  },

  /**
   * @method updateModifiedRange
   *
   * @param {number} start start index of the update operation
   * @param {number} end end index of the update operation
   * @param {boolean} isRemove whether this is a remove or insert operation
   * @private
   */
  updateModifiedRange(start, end, isRemove = false) {
    if (isRemove && ! isEmpty(this.modifiedRange)) {
      const [currentStart, currentEnd] = this.modifiedRange;
      var newStart, newEnd;
      const delta = end - start;
      if (currentStart > start  && currentStart > end) {
        // |removed text|[inserted text]
        newStart = currentStart - delta;
        newEnd = currentEnd - delta;
        this.set('modifiedRange', [ newStart, newEnd ]);
      }
      else if (currentStart == start && currentEnd == end) {
        // [|removed text inserted text|]
        this.set('modifiedRange', A());
      }
      else if (currentStart > start && currentEnd > end) {
        // | removed text [ inserted| text]
        newStart = currentStart - (currentStart - start);
        newEnd = currentEnd - delta;
        this.set('modifiedRange', [ newStart, newEnd ]);
      }
      else if ( currentStart <= start && currentEnd <= end ) {
        // [ inserted |removed  text| text]
        // full equality is handled above
        newStart = currentStart;
        newEnd = currentEnd - delta;
        this.set('modifiedRange', [ newStart, newEnd ]);
      }
      else if (currentStart < start && currentEnd < start ) {
        // no need to update range for [ inserted text][removed text]
      }
    }
    else {
      // insertText, increase range as necessary
      if (isEmpty(this.modifiedRange)) {
        this.set('modifiedRange', [ start, end ]);
      }
      else {
        const [currentStart, currentEnd] = this.modifiedRange;
        this.set('modifiedRange', [Math.min (currentStart, start), Math.max(currentEnd, end)]);
      }
    }
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

  handleNewCardInRegistry(hightLightLocation){
      this.get('cardsLocationFlaggedNew').push(hightLightLocation);
  },

  handleRemovedCardInRegistry(hightLightLocation){
      this.get('cardsLocationFlaggedRemoved').push(hightLightLocation);
  },


  /**
   * Analyses the RDFa context and trigger hint updates through the editor dispatcher
   * based on the RDFa context and the current text in the editor
   *
   * @method analyseAndDispatch
   *
   * @param @param {Array} Optional argument to contain extra info.
   *
   * @public
   */
  analyseAndDispatch: scoped( function(extraInfo = []) {
    const node = this.get('editor').get('rootNode');
    if (! isEmpty(this.modifiedRange)) {
      const contexts = analyse(node, this.modifiedRange);

      this.get('dispatcher').dispatch(
        this.get('profile'),
        this.get('registry').currentIndex(),
        contexts,
        this.get('registry'),
        this.get('editor'),
        extraInfo
      );
      this.set('modifiedRange', A());
    }
  }),

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
  removeText: scoped( function(start,stop) {
    this.updateModifiedRange(start, stop, true);
    return this.get('registry').removeText(start, stop);
  }),

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
  insertText: scoped( function(index, text) {
    this.updateModifiedRange(index, index + text.length);
    return this.get('registry').insertText(index, text);
  }),

  /**
   * Handling the change of the current selected text/location in the editor
   *
   * @method selectionChanged
   *
   * @public
   */
  selectionChanged: scoped( function() {
    this.get('registry').set('activeRegion', this.get('editor.currentSelection'));
  })
});
