import Component from "@glimmer/component";
import {action} from "@ember/object"
import boldProperty from '../../utils/rdfa/bold-property';
import italicProperty from '../../utils/rdfa/italic-property';
import underlineProperty from '../../utils/rdfa/underline-property';
import strikethroughProperty from '../../utils/rdfa/strikethrough-property';
import { isInList } from '@lblod/ember-rdfa-editor/utils/ce/list-helpers';
import { getWindowSelection } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { RawEditor } from "@lblod/ember-rdfa-editor/editor/raw-editor";
import EditorProperty from "dummy/utils/ce/editor-property";

interface Args {
  editor: RawEditor;
  showTextStyleButtons: boolean;
  showListButtons: boolean;
  showIndentButtons: boolean;
}

/**
 * RDFa editor toolbar component
 * @module rdfa-editor
 * @class RdfaEditorToolbarComponent
 * @extends Component
 */
export default class EditorToolbar extends Component<Args> {

  @action
  toggleProperty(property: EditorProperty) {
    const range = this.args.editor.currentSelection;
    const selection = this.args.editor.selectCurrentSelection();
    this.args.editor.toggleProperty(selection, property);
    // set cursor at end of selection, TODO: check what other editors do but this feels natural
    this.args.editor.setCurrentPosition(range[1]);
  }

  @action
  insertUL() {
    this.args.editor.insertUL();
  }

  @action
  insertOL() {
    this.args.editor.insertOL();
  }

  @action
  insertIndent() {
    const selection = getWindowSelection();
    if (selection.isCollapsed) {
      // colllapsed selections that are not in a list are not properly handled, this is a temporary workaround until we have a better toolbar.
      if (isInList(selection.anchorNode)) {
        this.args.editor.insertIndent();
      }
      else {
        //refocus editor
        this.args.editor.rootNode.focus();
      }
    }
    else {
      this.args.editor.insertIndent();
    }
  }

  @action
  insertUnindent() {
    const selection = getWindowSelection();
    if (selection.isCollapsed) {
      // colllapsed selections that are not in a list are not properly handled, this is a temporary workaround until we have a better toolbar.
      if (isInList(selection.anchorNode)) {
        this.args.editor.insertUnindent();
      }
      else {
        //refocus editor
        this.args.editor.rootNode.focus();
      }
    }
    else {
      this.args.editor.insertUnindent();
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
    this.args.editor.undo();
  }
}
