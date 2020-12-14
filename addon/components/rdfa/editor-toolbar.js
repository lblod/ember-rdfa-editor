import { action } from "@ember/object";
import { layout as templateLayout } from "@ember-decorators/component";
import Component from '@ember/component';
import layout from '../../templates/components/rdfa/editor-toolbar';
import boldProperty from '../../utils/rdfa/bold-property';
import italicProperty from '../../utils/rdfa/italic-property';
import underlineProperty from '../../utils/rdfa/underline-property';
import strikethroughProperty from '../../utils/rdfa/strikethrough-property';
import { isInList } from '@lblod/ember-rdfa-editor/utils/ce/list-helpers';
import { getWindowSelection } from '@lblod/ember-rdfa-editor/utils/dom-helpers';

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
    const selection = this.contentEditable.selectCurrentSelection();
    this.contentEditable.toggleProperty(selection, property);
    // set cursor at end of selection, TODO: check what other editors do but this feels natural
    this.contentEditable.setCurrentPosition(range[1]);
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
    const selection = getWindowSelection();
    if (selection.isCollapsed) {
      // colllapsed selections that are not in a list are not properly handled, this is a temporary workaround until we have a better toolbar.
      if (isInList(selection.anchorNode)) {
        this.contentEditable.insertIndent();
      }
      else {
        //refocus editor
        this.contentEditable.rootNode.focus();
      }
    }
    else {
      this.contentEditable.insertIndent();
    }
  }

  @action
  insertUnindent() {
    const selection = getWindowSelection();
    if (selection.isCollapsed) {
      // colllapsed selections that are not in a list are not properly handled, this is a temporary workaround until we have a better toolbar.
      if (isInList(selection.anchorNode)) {
        this.contentEditable.insertUnindent();
      }
      else {
        //refocus editor
        this.contentEditable.rootNode.focus();
      }
    }
    else {
      this.contentEditable.insertUnindent();
    }
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
