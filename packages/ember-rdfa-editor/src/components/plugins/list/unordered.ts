import { findParentNode } from '@curvenote/prosemirror-utils';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { toggleList } from '#root/plugins/list/index.ts';
import { autoJoin, chainCommands } from 'prosemirror-commands';
import { wrapInList } from 'prosemirror-schema-list';
import type { Command } from 'prosemirror-state';
import SayController from '#root/core/say-controller.ts';
import { ListBulletsIcon } from '@appuniversum/ember-appuniversum/components/icons/list-bullets';

type Args = {
  controller: SayController;
};

export default class ListUnordered extends Component<Args> {
  UnorderedListIcon = ListBulletsIcon;

  get firstListParent() {
    return findParentNode(
      (node) =>
        node.type === this.schema.nodes['ordered_list'] ||
        node.type === this.schema.nodes['bullet_list'],
    )(this.selection);
  }

  get isActive() {
    return (
      this.firstListParent?.node.type ===
      this.controller.schema.nodes['bullet_list']
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
      toggleList(
        this.schema.nodes['bullet_list'],
        this.schema.nodes['list_item'],
      ),
      wrapInList(this.schema.nodes['bullet_list']),
    );
  }

  get canToggle() {
    return this.controller.checkCommand(this.toggleCommand);
  }

  @action
  toggle() {
    if (this.controller) {
      this.controller.focus();
      this.controller.doCommand(
        autoJoin(this.toggleCommand, ['ordered_list', 'bullet_list']),
      );
    }
  }
}
