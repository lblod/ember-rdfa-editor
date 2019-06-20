import Component from '@ember/component';
import layout from '../templates/components/editor-toolbar';
import boldProperty from '../utils/bold-property';
import italicProperty from '../utils/italic-property';
import underlineProperty from '../utils/underline-property';
export default Component.extend({
  layout,
  classNames: ["toolbar"],

  toggleProperty(property) {
    const range = this.contentEditable.currentSelection;
    const selection = this.contentEditable.selectHighlight(range);
    if (range[0]==range[1] && this.contentEditable.currentNode) {
      // collapsed range, toggling property at cursor position requires more cursor handling atm
      const wasEnabled = property.enabledAt(this.contentEditable.getRichNodeFor(this.contentEditable.currentNode));
      this.contentEditable.toggleProperty(selection, property);
      if (wasEnabled) {
        const newSelection = this.contentEditable.selectHighlight(range);
        const disabledNode = newSelection.selections.find( (s) => ! property.enabledAt(s.richNode));


        if (disabledNode) {
          this.contentEditable.setCarret(disabledNode.richNode.domNode, 0);
        }
      }
      this.contentEditable.setCurrentPosition(range[1]);
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
    undo(){
      this.contentEditable.undo();
    }
  }
});
