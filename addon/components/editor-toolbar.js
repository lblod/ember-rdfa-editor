import Component from '@ember/component';
import layout from '../templates/components/editor-toolbar';

export default Component.extend({
  layout,
  classNames: ["toolbar"],

  actions: {
    insertUL(){
      this.contentEditable.insertUL();
    },

    insertOL(){
      this.contentEditable.insertOL();
    },

    insertIndent(){
      this.contentEditable.insertIndent();
    },

    insertUnindent(){
      this.contentEditable.insertUnindent();
    },

    undo(){
      this.contentEditable.undo();
    }
  }
});
