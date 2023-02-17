import { findParentNode } from '@curvenote/prosemirror-utils';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { toggleList } from '@lblod/ember-rdfa-editor/plugins/list';
import { autoJoin, chainCommands } from 'prosemirror-commands';
import { sinkListItem, wrapInList } from 'prosemirror-schema-list';
import { Command } from 'prosemirror-state';
import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

type Args = {
  controller: SayController;
};
export default class ListOrdered extends Component<Args> {
  get firstListParent() {
    return findParentNode(
      (node) =>
        node.type === this.schema.nodes.ordered_list ||
        node.type === this.schema.nodes.bullet_list
    )(this.selection);
  }

  get isActive() {
    return (
      this.firstListParent?.node.type ===
      this.controller.schema.nodes.ordered_list
    );
  }

  get controller() {
    return this.args.controller;
  }

  get selection() {
    return this.controller.getState(true).selection;
  }

  get schema() {
    return this.controller.schema;
  }

  get toggleCommand(): Command {
    return chainCommands(
      toggleList(this.schema.nodes.ordered_list, this.schema.nodes.list_item),
      wrapInList(this.schema.nodes.ordered_list),
      sinkListItem(this.schema.nodes.list_item)
    );
  }

  get canToggle() {
    return this.controller.checkCommand(this.toggleCommand, true);
  }

  @action
  toggle() {
    this.controller.focus();
    this.controller.checkAndDoCommand(
      autoJoin(this.toggleCommand, ['ordered_list', 'bullet_list']),
      true
    );
  }
}
