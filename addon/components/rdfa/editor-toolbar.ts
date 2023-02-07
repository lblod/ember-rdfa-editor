import {action} from '@ember/object';
import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {ProseController} from '@lblod/ember-rdfa-editor/core/prosemirror';
import {
  liftListItem,
  sinkListItem,
  wrapInList,
} from 'prosemirror-schema-list';
import {redo, undo} from 'prosemirror-history';
import {NodeType} from 'prosemirror-model';
import {setBlockType} from '@lblod/ember-rdfa-editor/commands/set-block-type';
import {findParentNode} from '@curvenote/prosemirror-utils';

interface Args {
  showTextStyleButtons: boolean;
  showListButtons: boolean;
  showIndentButtons: boolean;
  controller: ProseController;
}

/**
 * RDFa editor toolbar component
 * @module rdfa-editor
 * @class RdfaEditorToolbarComponent
 * @extends Component
 */
export default class EditorToolbar extends Component<Args> {
  @tracked tableAddRows = 2;
  @tracked tableAddColumns = 2;

  get isBold() {
    return this.controller.isMarkActive(
      this.controller.schema.marks.strong,
      true
    );
  }

  get isItalic() {
    return this.controller.isMarkActive(this.controller.schema.marks.em, true);
  }

  get isUnderline() {
    return this.controller.isMarkActive(
      this.controller.schema.marks.underline,
      true
    );
  }

  get isStrikethrough() {
    return this.controller.isMarkActive(
      this.controller.schema.marks.strikethrough,
      true
    );
  }

  get firstListParent() {
    return findParentNode(
      (node) =>
        node.type === this.schema.nodes.ordered_list ||
        node.type === this.schema.nodes.bullet_list
    )(this.selection);
  }

  get isInUL() {
    return this.firstListParent?.node.type === this.schema.nodes.bullet_list;
  }

  get isInOL() {
    return this.firstListParent?.node.type === this.schema.nodes.ordered_list;
  }

  get controller() {
    return this.args.controller;
  }

  get selection() {
    return this.controller.getState(true).selection;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get ULButtonActive() {
    this.canUnindent &&
    !this.canInsertListOfType(this.schema.nodes.bullet_list);
  }

  get canWrapInUL() {
    return this.controller.checkCommand(
      wrapInList(this.controller.schema.nodes.bullet_list),
      true
    );
  }

  get canWrapInOL() {
    return this.controller.checkCommand(
      wrapInList(this.controller.schema.nodes.ordered_list),
      true
    );
  }

  get canSink() {
    return this.controller.checkCommand(
      sinkListItem(this.controller.schema.nodes.list_item)
    );
  }

  get canLift() {
    return this.controller.checkCommand(
      liftListItem(this.controller.schema.nodes.list_item)
    );
  }

  @action
  wrapInUL() {
    this.controller.focus();
    this.controller.doCommand(wrapInList(this.schema.nodes.bullet_list), true);
  }

  @action
  wrapInOL() {
    this.controller.focus();
    this.controller.doCommand(wrapInList(this.schema.nodes.ordered_list), true);
  }

  @action
  setOL() {
    this.controller.focus();
    this.controller.doCommand(
      setBlockType(this.schema.nodes.ordered_list),
      true
    );
  }

  get isInList() {
    return this.isInOrderedList || this.isInUnorderedList;
  }

  get isInUnorderedList() {
    return (
      this.canUnindent &&
      this.canInsertListOfType(this.controller.schema.nodes.ordered_list)
    );
  }

  get isInOrderedList() {
    return (
      this.canUnindent &&
      this.canInsertListOfType(this.controller.schema.nodes.bullet_list)
    );
  }

  canInsertListOfType(type: NodeType) {
    return this.controller.checkCommand(wrapInList(type));
  }

  get canInsertList() {
    return (
      this.canInsertListOfType(this.controller.schema.nodes.bullet_list) ||
      this.isInList
    );
  }

  get canIndent() {
    return this.controller.checkCommand(
      sinkListItem(this.controller.schema.nodes.list_item),
      true
    );
  }

  get canUnindent() {
    return this.controller.checkCommand(
      liftListItem(this.controller.schema.nodes.list_item),
      true
    );
  }

  @action
  insertIndent() {
    this.controller.focus();
    this.controller.doCommand(
      sinkListItem(this.controller.schema.nodes.list_item),
      true
    );
  }

  @action
  insertUnindent() {
    this.controller.focus();
    this.controller.doCommand(
      liftListItem(this.controller.schema.nodes.list_item),
      true
    );
  }

  @action
  toggleItalic() {
    this.controller.toggleMark('em', true);
  }

  @action
  toggleUnorderedList() {
    this.controller.focus();
    if (this.isInUnorderedList) {
      while (this.canUnindent) {
        this.insertUnindent();
      }
    } else {
      this.controller.checkAndDoCommand(
        wrapInList(this.controller.schema.nodes.bullet_list),
        true
      );
    }
  }

  @action
  toggleOrderedList() {
    this.controller.focus();
    if (this.isInOrderedList) {
      while (this.canUnindent) {
        this.insertUnindent();
      }
    } else {
      this.controller.checkAndDoCommand(
        wrapInList(this.controller.schema.nodes.ordered_list),
        true
      );
    }
  }

  @action
  toggleBold() {
    this.controller.toggleMark('strong', true);
  }

  @action
  toggleUnderline() {
    this.controller.toggleMark('underline', true);
  }

  @action
  toggleStrikethrough() {
    this.controller.toggleMark('strikethrough', true);
  }

  @action
  undo() {
    this.controller.focus();
    this.controller.doCommand(undo);
  }

  @action
  redo() {
    this.controller.focus();
    this.controller.doCommand(redo);
  }
}
