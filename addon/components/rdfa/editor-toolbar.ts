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

  get controller() {
    return this.args.controller;
  }

  get isInList() {
    return this.canUnindent;
  }

  get canInsertList() {
    return (
      this.controller.checkCommand(
        wrapInList(this.controller.schema.nodes.bullet_list),
        true
      ) || this.isInList
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
    if (this.isInList) {
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
    this.controller.checkAndDoCommand(
      wrapInList(this.controller.schema.nodes.ordered_list),
      true
    );
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
}
