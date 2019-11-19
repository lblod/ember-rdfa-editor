import classic from "ember-classic-decorator";
import { action } from "@ember/object";
import { classNames, layout as templateLayout } from "@ember-decorators/component";
import Component from '@ember/component';
import layout from '../../templates/components/rdfa/editor-toolbar';
import boldProperty from '../../utils/rdfa/bold-property';
import italicProperty from '../../utils/rdfa/italic-property';
import underlineProperty from '../../utils/rdfa/underline-property';
import strikethroughProperty from '../../utils/rdfa/strikethrough-property';

/**
 * RDFa editor toolbar component
 * @module rdfa-editor
 * @class RdfaEditorToolbarComponent
 * @extends Component
 */
@templateLayout(layout)
export default class EditorToolbar extends Component {
  tagName = "";

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
  }

  @action
  insertUL() {
    this.contentEditable.insertUL();
  }

  @action
  insertOL() {
    this.contentEditable.insertOL();
  }

  @action
  insertIndent() {
    this.contentEditable.insertIndent();
  }

  @action
  insertUnindent() {
    this.contentEditable.insertUnindent();
  }

  @action
  toggleItalic() {
    this.toggleProperty(italicProperty);
  }

  @action
  toggleBold() {
    this.toggleProperty(boldProperty);
  }

  @action
  toggleUnderline() {
    this.toggleProperty(underlineProperty);
  }

  @action
  toggleStrikethrough() {
    this.toggleProperty(strikethroughProperty);
  }

  @action
  undo() {
    this.contentEditable.undo();
  }
}
