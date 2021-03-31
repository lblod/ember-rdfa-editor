import { assert } from '@ember/debug';
import EmberObject from '@ember/object';
import { analyse } from '@lblod/marawa/rdfa-context-scanner';
import HintsRegistry from './hints-registry';
import { A } from '@ember/array';
import { isEmpty } from '@ember/utils';
import globalTextOffsetToPath from '@lblod/ember-rdfa-editor/utils/global-text-offset-to-path';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import RdfaEditorDispatcher from 'dummy/services/rdfa-editor-dispatcher';
import RawEditor from '../ce/raw-editor';
import { ContentObserver } from '../ce/pernet-raw-editor';
import MovementObserver from '../ce/movement-observers/movement-observer';
import { InternalSelection } from '@lblod/ember-rdfa-editor/editor/raw-editor';


/**
* Event processor orchastrating the hinting based on incoming editor events
*
* @module rdfa-editor
* @class EventProcessor
* @constructor
* @extends EmberObject
*/
export default class EventProcessor implements ContentObserver, MovementObserver {
  /**
   * @property registry
   * @type HintsRegistry
   */
  registry: HintsRegistry;
  cardsLocationFlaggedRemoved: Array<[number, number]>;
  cardsLocationFlaggedNew: Array<[number, number]>;
  dispatcher: RdfaEditorDispatcher;
  /**
   * this is the range spanning all text inserts as recorded between two dispatchAndAnalyse calls
   */
  modifiedRange: number[];
  editor: RawEditor;

  /**
   * @property profile
   * @type string
   */
  profile: string;

  constructor({ registry, profile, dispatcher, editor} : { registry: HintsRegistry, profile: string, dispatcher: RdfaEditorDispatcher, editor: RawEditor}) {
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
  updateModifiedRange(start: number, end: number, isRemove: boolean = false) {
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
      const startPos = globalTextOffsetToPath(this.editor, start);
      const endPos = globalTextOffsetToPath(this.editor, end);
      const selection = this.editor.createSelection();
      selection.selectRange(this.editor.createRangeFromPaths(startPos, endPos));
      this.editor.executeCommand("remove-highlight", selection);
    }

    for (let [start, end] of this.cardsLocationFlaggedNew) {
      const startPos = globalTextOffsetToPath(this.editor, start);
      const endPos = globalTextOffsetToPath(this.editor, end);
      const selection = this.editor.createSelection();
      selection.selectRange(this.editor.createRangeFromPaths(startPos, endPos));
      this.editor.executeCommand("make-highlight", selection);
    }

    this.cardsLocationFlaggedNew = [];
    this.cardsLocationFlaggedRemoved = [];
  }

  handleNewCardInRegistry(hightLightLocation: [number, number]){
    this.cardsLocationFlaggedNew.push(hightLightLocation);
  }

  handleRemovedCardInRegistry(hightLightLocation: [number, number]){
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
  analyseAndDispatch(extraInfo: Array<Object> = []) {
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

  handleFullContentUpdate(extraInfo: Array<Object> = []) {
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
  handleTextRemoval(start: number, stop: number) {
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
  handleTextInsert(index: number, text: string) {
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
  handleMovement(_controller: RawEditor, _oldSelection: InternalSelection , newSelection: InternalSelection) {
    const {startNode, endNode } = newSelection;
    this.registry.activeRegion = [startNode.absolutePosition, endNode.absolutePosition];
  }
}
