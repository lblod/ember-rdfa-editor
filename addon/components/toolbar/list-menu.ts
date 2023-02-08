import { action } from '@ember/object';
import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import {
  liftListItem,
  sinkListItem,
  wrapInList,
} from 'prosemirror-schema-list';

type Args = {
  controller?: ProseController;
  mark: string;
};
export default class ListComponent extends Component<Args> {
  get controller() {
    return this.args.controller;
  }
  get isInList() {
    return this.canUnindent;
  }

  get canInsertList() {
    return (
      this.controller?.checkCommand(
        wrapInList(this.controller.schema.nodes.bullet_list),
        true
      ) || this.isInList
    );
  }

  get canIndent() {
    return this.controller?.checkCommand(
      sinkListItem(this.controller.schema.nodes.list_item),
      true
    );
  }

  get canUnindent() {
    return this.controller?.checkCommand(
      liftListItem(this.controller.schema.nodes.list_item),
      true
    );
  }

  @action
  insertIndent() {
    this.controller?.focus();
    this.controller?.doCommand(
      sinkListItem(this.controller.schema.nodes.list_item),
      true
    );
  }

  @action
  insertUnindent() {
    this.controller?.focus();
    this.controller?.doCommand(
      liftListItem(this.controller.schema.nodes.list_item),
      true
    );
  }

  @action
  toggleUnorderedList() {
    this.controller?.focus();
    if (this.isInList) {
      while (this.canUnindent) {
        this.insertUnindent();
      }
    } else {
      this.controller?.checkAndDoCommand(
        wrapInList(this.controller.schema.nodes.bullet_list),
        true
      );
    }
  }

  @action
  toggleOrderedList() {
    this.controller?.focus();
    this.controller?.checkAndDoCommand(
      wrapInList(this.controller.schema.nodes.ordered_list),
      true
    );
  }
}
