import { assert } from '@ember/debug';
import EmberObject from '@ember/object';
import { analyse } from '@lblod/marawa/rdfa-context-scanner';
import HintsRegistry from './hints-registry';
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import textOffsetToPosition from '@lblod/ember-rdfa-editor/utils/text-offset-to-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';


/**
* Event processor orchastrating the hinting based on incoming editor events
*
* @module rdfa-editor
* @class EventProcessor
* @constructor
* @extends EmberObject
*/
export default class EventProcessor {
  /**
   * @property registry
   * @type HintsRegistry
   */
  registry;
  cardsLocationFlaggedRemoved;
  cardsLocationFlaggedNew;
  rdfaEditorDispatcher;
  /**
   * this is the range spanning all text inserts as recorded between two dispatchAndAnalyse calls
   *
   * @property modifiedRange
   * @type Array
   */
  modifiedRange;

  /**
   * @property editor
   * @type RdfaEditor
   */
  editor;

  /**
   * @property profile
   * @type string
   */
  profile;

  /**
   * @property dispatcher
   * @type EditorDispatcher
   */
  dispatcher;

  constructor({ registry, profile, dispatcher, editor}) {
    this.cardsLocationFlaggedNew = [];
    this.cardsLocationFlaggedRemoved = [];
    this.modifiedRange = [];
    this.registry = registry;
    this.profile = profile;
    this.dispatcher = dispatcher;
    this.editor = editor;
  }

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
        this.modifiedRange = [ newStart, newEnd ];
      }
      else if (currentStart == start && currentEnd == end) {
        // [|removed text inserted text|]
        this.modifiedRange = [];
      }
      else if (currentStart > start && currentEnd > end) {
        // | removed text [ inserted| text]
        newStart = currentStart - (currentStart - start);
        newEnd = currentEnd - delta;
        this.modifiedRange = [ newStart, newEnd ];
      }
      else if ( currentStart <= start && currentEnd <= end ) {
        // [ inserted |removed  text| text]
        // full equality is handled above
        newStart = currentStart;
        newEnd = currentEnd - delta;
        this.modifiedRange = [ newStart, newEnd ];
      }
      else if (currentStart < start && currentEnd < start ) {
        // no need to update range for [ inserted text][removed text]
      }
    }
    else {
      // insertText, increase range as necessary
      if (isEmpty(this.modifiedRange)) {
        this.modifiedRange = [ start, end ];
      }
      else {
        const [currentStart, currentEnd] = this.modifiedRange;
        this.modifiedRange = [Math.min (currentStart, start), Math.max(currentEnd, end)];
      }
    }
  }

  /**
   * Observer of the registry updating the highlighted hints in the editor
   *
   * @method handleRegistryChange
   *
   * @param {Ember.Array} registry
   * @public
   */
  handleRegistryChange(/*registry*/) {
    for (let [start,end] of this.cardsLocationFlaggedRemoved) {
      const startPos = textOffsetToPosition(this.editor, start);
      const endPos = textOffsetToPosition(this.editor, end);
      const selection = this.editor.createSelection();
      selection.selectRange(this.editor.createRangefromPaths(startPos, endPos));
      this.editor.executeCommand("remove-highlight", selection);
    }

    for (let [start, end] of this.cardsLocationFlaggedNew) {
      const startPos = textOffsetToPosition(this.editor, start);
      const endPos = textOffsetToPosition(this.editor, end);
      const selection = this.editor.createSelection();
      selection.selectRange(this.editor.createRangefromPaths(startPos, endPos));
      this.editor.executeCommand("make-highlight", selection);
    }

    this.cardsLocationFlaggedNew = [];
    this.cardsLocationFlaggedRemoved = [];
  }

  handleNewCardInRegistry(hightLightLocation){
    this.cardsLocationFlaggedNew.push(hightLightLocation);
  }

  handleRemovedCardInRegistry(hightLightLocation){
    this.cardsLocationFlaggedRemoved.push(hightLightLocation);
  }

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
  analyseAndDispatch(extraInfo = []) {
    const node = this.editor.rootNode;
    if (! isEmpty(this.modifiedRange)) {
      const rdfaBlocks = analyse(node, this.modifiedRange);

      this.dispatcher.dispatch(
        this.profile,
        this.registry.currentIndex(),
        rdfaBlocks,
        this.registry,
        this.editor,
        extraInfo
      );
      this.modifiedRange = [];
    }
  }

  handleFullContentUpdate(extraInfo = []) {
    this.analyseAndDispatch(extraInfo);
  }

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
  handleTextRemoval(start,stop) {
    this.updateModifiedRange(start, stop, true);
    return this.registry.removeText(start, stop);
  }

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
  handleTextInsert(index, text) {
    this.updateModifiedRange(index, index + text.length);
    return this.registry.insertText(index, text);
  }

  /**
   * Handling the change of the current selected text/location in the editor
   *
   * @method handleMovement
   *
   * @public
   */
  handleMovement(_controller, _oldSelection, newSelection) {
    const {startNode, endNode } = newSelection;
    this.registry.activeRegion = [startNode.absolutePosition, endNode.absolutePosition];
  }
}
