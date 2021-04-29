import Component from "@glimmer/component";
import {action} from "@ember/object";
import {tracked} from "@glimmer/tracking";
import LegacyRawEditor from "@lblod/ember-rdfa-editor/utils/ce/legacy-raw-editor";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {PropertyState} from "@lblod/ember-rdfa-editor/model/util/types";

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
  @tracked isBold = false;
  @tracked isItalic = false;
  @tracked isStrikethrough = false;
  @tracked isUnderline = false;
  @tracked isInList = false;
  @tracked canInsertList = true;
  @tracked isInTable = false;
  @tracked canIndent = false;
  @tracked canUnindent = false;

  constructor(parent: unknown, args: Args) {
    super(parent, args);
    document.addEventListener("richSelectionUpdated", this.updateProperties.bind(this));
  }
  updateProperties(event: CustomEvent<ModelSelection>) {
    this.isBold = event.detail.bold === PropertyState.enabled;
    this.isItalic = event.detail.italic === PropertyState.enabled;
    this.isUnderline = event.detail.underline === PropertyState.enabled;
    this.isStrikethrough = event.detail.strikethrough === PropertyState.enabled;
    this.isInList = event.detail.inListState === PropertyState.enabled;
    this.canInsertList = this.args.editor.canExecuteCommand("make-list");
    this.isInTable = event.detail.inTableState === PropertyState.enabled;
    this.canIndent = this.isInList && this.args.editor.canExecuteCommand("indent-list");
    this.canUnindent = this.isInList && this.args.editor.canExecuteCommand("unindent-list");
  }

  @action
  insertIndent() {
    if(this.isInList) {
      this.args.editor.executeCommand("indent-list");
    }
  }

  @action
  insertUnindent() {
    if(this.isInList) {
      this.args.editor.executeCommand("unindent-list");
    }
  }
  @action
  insertNewLine(){
    this.args.editor.executeCommand("insert-newLine");
  }

  @action
  insertNewLi(){
    this.args.editor.executeCommand("insert-newLi");
  }

  @action
  toggleItalic() {
    this.toggleProperty(this.isItalic, "make-italic", "remove-italic");
  }

  @action
  toggleUnorderedList() {
    if(this.isInList) {
      this.args.editor.executeCommand("remove-list");
    } else {
      this.args.editor.executeCommand("make-list", "ul");
    }
  }
  @action
  toggleOrderedList() {
    if(this.isInList) {
      this.args.editor.executeCommand("remove-list");
    } else {
      this.args.editor.executeCommand("make-list", "ol");
    }
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

  //Table commands
  @action
  insertTable(){
    this.args.editor.executeCommand("insert-table");
  }

  @action
  insertRowBelow(){
    this.args.editor.executeCommand("insert-table-row-below");
  }

  @action
  insertRowAbove(){
    this.args.editor.executeCommand("insert-table-row-above");
  }

  @action
  insertColumnAfter(){
    this.args.editor.executeCommand("insert-table-column-after");
  }

  @action
  insertColumnBefore(){
    this.args.editor.executeCommand("insert-table-column-before");
  }

  @action
  removeTableRow(){
    this.args.editor.executeCommand("remove-table-row");
  }

  @action
  removeTableColumn(){
    this.args.editor.executeCommand("remove-table-column");
  }

  @action
  removeTable(){
    this.args.editor.executeCommand("remove-table");
  }
}
