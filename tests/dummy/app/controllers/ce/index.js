import Controller from '@ember/controller';
import { debug } from '@ember/debug';
import { A } from '@ember/array';
export default Controller.extend({
  init() {
    this._super(...arguments);
    this.set('currentSelection', [0, 0]);
    this.set('components', A());
  },
  rawEditor: null,
  highlight: false,
  showContent: true,
  actions: {
    rawEditorInit(editor) {
      this.set('rawEditor', editor);
    },
    toggleContent() {
      this.toggleProperty('showContent');
    },
    selectionUpdate() {
      this.set('currentSelection',this.rawEditor.currentSelection);
    },
    handleTextInsert(start, content) {
      debug('text insert');
      debug(start + ' ' + content);
    },
    handleTextRemove(start,end) {
      debug('text remove');
      debug(start + ' ' +  end);
    },
    elementUpdate() {
      debug(this.rawEditor.rootNode);
    },
    highlightText() {
      let sel = this.currentSelection;
      this.rawEditor.highlightRange(...sel, {typeof: "schema:CreativeWork"});
    },
    insertComponentOnCursor() {
      let [start] = this.currentSelection;
      this.rawEditor.insertComponent(start, "a-test-component", {aanwezigen: { joris: false, niels: true, jan: true, piet:false}});
    },
    removeHighlight() {
      let sel = this.currentSelection;
      this.rawEditor.clearHighlightForLocations([sel]);
    },
    clearAll() {
      this.rawEditor.clearHighlightForLocations([this.rawEditor.richNode.region]);
    },
    insertUL(){
      this.rawEditor.insertUL();
    },
    addContextOnCurrentSelection() {
      let selection = this.rawEditor.selectCurrentSelection();
      this.rawEditor.update(selection, { set: { property: 'http://foo/testProperty' } });
    }
  }
});
