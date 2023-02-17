import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import {
  liftListItem,
  sinkListItem,
  wrapInList,
} from 'prosemirror-schema-list';
import { redo, undo } from 'prosemirror-history';
import { findParentNode } from '@curvenote/prosemirror-utils';
import { toggleList } from '@lblod/ember-rdfa-editor/commands/toggle-list';
import { autoJoin, chainCommands } from 'prosemirror-commands';
import { Command } from 'prosemirror-state';

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

  get schema() {
    return this.controller.schema;
  }

  get isBold() {
    return this.controller.isMarkActive(this.schema.marks.strong, true);
  }

  get isItalic() {
    return this.controller.isMarkActive(this.schema.marks.em, true);
  }

  get isUnderline() {
    return this.controller.isMarkActive(this.schema.marks.underline, true);
  }

  get isStrikethrough() {
    return this.controller.isMarkActive(this.schema.marks.strikethrough, true);
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

  get canIndent() {
    return this.controller.checkCommand(
      sinkListItem(this.schema.nodes.list_item),
      true
    );
  }

  get canUnindent() {
    return this.controller.checkCommand(
      liftListItem(this.schema.nodes.list_item),
      true
    );
  }

  get toggleUnordered(): Command {
    return chainCommands(
      toggleList(this.schema.nodes.bullet_list, this.schema.nodes.list_item),
      wrapInList(this.schema.nodes.bullet_list)
    );
  }

  get toggleOrdered(): Command {
    return chainCommands(
      toggleList(this.schema.nodes.ordered_list, this.schema.nodes.list_item),
      wrapInList(this.schema.nodes.ordered_list),
      sinkListItem(this.schema.nodes.list_item)
    );
  }

  @action
  insertIndent() {
    this.controller.focus();
    this.controller.doCommand(sinkListItem(this.schema.nodes.list_item), true);
  }

  @action
  insertUnindent() {
    this.controller.focus();
    this.controller.doCommand(liftListItem(this.schema.nodes.list_item), true);
  }

  @action
  toggleItalic() {
    this.controller.toggleMark(this.schema.marks.em, true);
  }

  get canToggleUL() {
    return this.controller.checkCommand(this.toggleUnordered, true);
  }

  get canToggleOL() {
    return this.controller.checkCommand(this.toggleOrdered, true);
  }

  @action
  toggleUnorderedList() {
    this.controller.focus();
    this.controller.doCommand(
      autoJoin(this.toggleUnordered, ['ordered_list', 'bullet_list']),
      true
    );
  }

  @action
  toggleOrderedList() {
    this.controller.focus();
    this.controller.doCommand(
      autoJoin(this.toggleOrdered, ['ordered_list', 'bullet_list']),
      true
    );
  }

  @action
  toggleBold() {
    this.controller.toggleMark(this.schema.marks.strong, true);
  }

  @action
  toggleUnderline() {
    this.controller.toggleMark(this.schema.marks.underline, true);
  }

  @action
  toggleStrikethrough() {
    this.controller.toggleMark(this.schema.marks.strikethrough, true);
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
