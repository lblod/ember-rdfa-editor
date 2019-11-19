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
    selectionUpdate() {
      this.set('currentSelection',this.get('rawEditor.currentSelection'));
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
      debug(this.get('rawEditor.rootNode'));
    },
    insertUL(){
      this.get('rawEditor').insertUL();
    },
    insertOL(){
      this.get('rawEditor').insertOL();
    },
    insertIndent(){
      this.get('rawEditor').insertIndent();
    },
    insertUnindent(){
      this.get('rawEditor').insertUnindent();
    }
  }
});
