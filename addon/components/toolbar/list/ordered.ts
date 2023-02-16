import { findParentNode } from '@curvenote/prosemirror-utils';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { toggleList } from '@lblod/ember-rdfa-editor/commands/toggle-list';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { autoJoin, chainCommands } from 'prosemirror-commands';
import { wrapInList, sinkListItem } from 'prosemirror-schema-list';
import { Command } from 'prosemirror-state';

type Args = {
  controller: ProseController;
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
    return this.controller.activeEditorState.selection;
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
    return this.controller.checkCommand(this.toggleCommand);
  }

  @action
  toggle() {
    this.controller.focus();
    this.controller.doCommand(
      autoJoin(this.toggleCommand, ['ordered_list', 'bullet_list'])
    );
  }
}
