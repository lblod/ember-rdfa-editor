import Component from "@glimmer/component";
import {action} from "@ember/object";
import {isInList} from '@lblod/ember-rdfa-editor/utils/ce/list-helpers';
import {getWindowSelection} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import {tracked} from "@glimmer/tracking";
import {PropertyState} from "@lblod/ember-rdfa-editor/utils/ce/model-selection-tracker";
import LegacyRawEditor from "@lblod/ember-rdfa-editor/utils/ce/legacy-raw-editor";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";

interface Args {
  editor: LegacyRawEditor;
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
  @tracked isBold: boolean = false;
  @tracked isItalic: boolean = false;
  @tracked isStrikethrough: boolean = false;
  @tracked isUnderline: boolean = false;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    document.addEventListener("richSelectionUpdated", this.updateProperties.bind(this));
  }
  updateProperties(event: CustomEvent<ModelSelection>) {
    console.log("richSelectionUpdated");
    this.isBold = event.detail.bold !== PropertyState.disabled;
    this.isItalic = event.detail.italic !== PropertyState.disabled;
    this.isStrikethrough = event.detail.strikethrough !== PropertyState.disabled;
    this.isUnderline = event.detail.underline !== PropertyState.disabled;
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
    this.toggleProperty(this.isItalic, "make-italic", "remove-italic");
  }

  @action
  toggleBold() {
    this.toggleProperty(this.isBold, "make-bold", "remove-bold");
  }

  @action
  toggleUnderline() {
    this.toggleProperty(this.isUnderline, "make-underline", "remove-underline");
  }

  @action
  toggleStrikethrough(){
    this.toggleProperty(this.isStrikethrough, "make-strikethrough", "remove-strikethrough");
  }

  @action
  toggleProperty(value: boolean, makeCommand: string, removeCommand: string) {
    if(value) {
      this.args.editor.executeCommand(removeCommand);
    } else {
      this.args.editor.executeCommand(makeCommand);
    }

  }

  @action
  undo() {
    this.args.editor.undo();
  }
}
