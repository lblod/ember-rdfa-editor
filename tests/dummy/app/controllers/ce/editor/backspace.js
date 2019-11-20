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
      this.set('editor', editor);
      window.editor = editor; //Handy to play with
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
    reload(){
      window.location.reload(true);
    }
  }
});
