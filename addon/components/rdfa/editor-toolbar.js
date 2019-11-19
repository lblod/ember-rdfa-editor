import Component from '@ember/component';
import layout from '../../../templates/components/editor-toolbar';
import boldProperty from '../utils/bold-property';
import italicProperty from '../utils/italic-property';
import underlineProperty from '../utils/underline-property';
import strikethroughProperty from '../utils/strikethrough-property';

/**
 * RDFa editor toolbar component
 * @module rdfa-editor
 * @class RdfaEditorToolbarComponent
 * @extends Component
 */
export default Component.extend({
  layout,
  classNames: ["toolbar"],

  toggleProperty(property) {
    const range = this.contentEditable.currentSelection;
    const selection = this.contentEditable.selectHighlight(range);
    if (range[0]==range[1] && this.contentEditable.currentNode) {
      this.contentEditable.togglePropertyAtCurrentPosition(property);
    }
    else {
      // selection
      this.contentEditable.toggleProperty(selection, property);
      this.contentEditable.setCurrentPosition(range[1]); // set cursor at end of selection, TODO: check what other editors do but this feels natural
    }
  },
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

    toggleItalic() {
      this.toggleProperty(italicProperty);
    },

    toggleBold() {
      this.toggleProperty(boldProperty);
    },

    toggleUnderline() {
      this.toggleProperty(underlineProperty);
    },

    toggleStrikethrough(){
      this.toggleProperty(strikethroughProperty);
    },

    undo(){
      this.contentEditable.undo();
    }
  }
});
