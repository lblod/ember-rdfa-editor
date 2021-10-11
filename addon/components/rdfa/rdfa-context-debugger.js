import { A } from '@ember/array';
import Component from '@glimmer/component';
import { analyse } from '@lblod/marawa/rdfa-context-scanner';
import { debug } from '@ember/debug';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import globalTextRegionToModelRange from '@lblod/ember-rdfa-editor/archive/utils/global-text-region-to-model-range';

/**
 * Debugger component for the RDFa context of DOM nodes
 *
 * @module rdfa-editor
 * @class RdfaContextDebugger
 * @extends Component
 */
export default class RdfaContextDebugger extends Component {
  /**
   * RDFa editor to debug in
   *
   * @property editor
   * @type RdfaEditor
   *
   * @public
   */
  get editor() {
    return this.args.controller;
  }

  @tracked blocks = null;
  @tracked selections = null
  @tracked selectOptions = null
  @tracked scanStart = 0;
  @tracked scanEnd = 1000;
  @tracked selectStart = 0;
  @tracked selectEnd = 1000;
  selectScopes = Object.freeze(['auto', 'inner', 'outer']);

  constructor() {
    super(...arguments);
    this.resetResults();
    this.selectionOptions = { scope: 'inner' };
  }

  resetResults() {
    this.blocks = A();
    this.selections= A();
  }

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
  @action
  analyse() {
    this.resetResults();
    const node = this.editor.rootNode;

    const blocks = analyse(node, [this.scanStart, this.scanEnd]);
    debug('Finished calculating blocks');
    this.blocks = blocks;
  }

  /**
   * Highlight the given region in the editor
   *
   * @method highlight
   *
   * @param {[number, number]} region Region to highlight
   *
   * @private
   */
  @action
  highlight([start, end]){
    const range = globalTextRegionToModelRange(this.editor.rootModelNode, start, end);
    const selection = this.editor.createSelection();
    selection.selectRange(range);
    this.editor.executeCommand("make-highlight", selection);
  }

  @action
  setScope(event) {
    this.selectOptions.scope = event.target.value;
  }

  @action
  updateScanStart(event) {
    this.scanStart = event.target.value;
  }

  @action
  updateScanEnd(event) {
    this.scanEnd = event.target.value;
  }

  @action
  updateSelectStart(event) {
    this.selectStart = event.target.value;
  }

  @action
  updateSelectEnd(event) {
    this.selectEnd = event.target.value;
  }

  @action
  selectContext() {
    this.resetResults();

    const splitValues = function(stringValue) {
      return (stringValue || "").split('\n').map(s => s.trim()).filter(s => s.length);
    };
    const options = this.selectOptions;
    options.typeof = splitValues(options.typeofString);
    options.property = splitValues(options.propertyString);

    const selections = this.editor.selectContext([this.scanStart, this.scanEnd], options);
    debug('Finished selecting contexts');
    this.selections = selections;
  }
}

