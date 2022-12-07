import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import {
  liftListItem,
  sinkListItem,
  wrapInList,
} from 'prosemirror-schema-list';
import { undo } from 'prosemirror-history';
import { deleteTable } from 'prosemirror-tables';

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
  @tracked canInsertList = true;
  @tracked tableAddRows = 2;
  @tracked tableAddColumns = 2;

  get isBold() {
    return this.controller.isMarkActive(this.controller.schema.marks.strong);
  }

  get isItalic() {
    return this.controller.isMarkActive(this.controller.schema.marks.em);
  }

  get isUnderline() {
    return this.controller.isMarkActive(this.controller.schema.marks.underline);
  }

  get isStrikethrough() {
    return this.controller.isMarkActive(
      this.controller.schema.marks.strikethrough
    );
  }

  get controller() {
    return this.args.controller;
  }

  get isInList() {
    return (
      !this.controller.checkCommand(
        wrapInList(this.controller.schema.nodes.bullet_list)
      ) || this.canIndent
    );
  }

  get canIndent() {
    return this.controller.checkCommand(
      sinkListItem(this.controller.schema.nodes.list_item)
    );
  }

  get canUnindent() {
    return this.controller.checkCommand(
      liftListItem(this.controller.schema.nodes.list_item)
    );
  }

  get isInTable() {
    return this.controller.checkCommand(deleteTable);
  }

  @action
  insertIndent() {
    this.controller.focus();
    this.controller.doCommand(
      sinkListItem(this.controller.schema.nodes.list_item)
    );
  }

  @action
  insertUnindent() {
    this.controller.focus();
    this.controller.doCommand(
      liftListItem(this.controller.schema.nodes.list_item)
    );
  }

  @action
  toggleItalic() {
    this.controller.toggleMark('em');
  }

  @action
  toggleUnorderedList() {
    this.controller.focus();
    if (this.isInList) {
      while (this.canUnindent) {
        this.insertUnindent();
      }
    } else {
      this.controller.checkAndDoCommand(
        wrapInList(this.controller.schema.nodes.bullet_list)
      );
    }
  }

  @action
  toggleOrderedList() {
    this.controller.focus();
    this.controller.checkAndDoCommand(
      wrapInList(this.controller.schema.nodes.ordered_list)
    );
  }

  @action
  toggleBold() {
    this.controller.toggleMark('strong');
  }

  @action
  toggleUnderline() {
    this.controller.toggleMark('underline');
  }

  @action
  toggleStrikethrough() {
    this.controller.toggleMark('strikethrough');
  }

  @action
  undo() {
    this.controller.focus();
    this.controller.doCommand(undo);
  }
}
