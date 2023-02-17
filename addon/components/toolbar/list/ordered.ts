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

  styles = [
    { name: 'decimal', description: 'Getallen'},
    { name: 'lower-alpha', description: 'Letters'},
    { name: 'upper-roman', description: 'Romeinse Cijfers'}
  ]
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

  toggleCommand(listStyle?: string): Command {
    return chainCommands(
      toggleList(this.schema.nodes.ordered_list, this.schema.nodes.list_item, {
        style: listStyle,
      }),
      wrapInList(this.schema.nodes.ordered_list, {
        style: listStyle,
      }),
      sinkListItem(this.schema.nodes.list_item)
    );
  }

  get canToggle() {
    return this.controller.checkCommand(this.toggleCommand(), true);
  }

  @action
  toggle(style?: string) {
    this.controller.focus();
    this.controller.doCommand(
      autoJoin(this.toggleCommand(style), ['ordered_list', 'bullet_list']),
      true
    );
  }

  @action
  setStyle(style: string) {
    const firstListParent = this.firstListParent;
    if (
      firstListParent?.node.type === this.controller.schema.nodes.ordered_list
    ) {
      const pos = firstListParent.pos;
      this.controller.withTransaction((tr) => {
        return tr.setNodeAttribute(pos, 'style', style);
      });
    } else {
      this.toggle(style);
    }
  }

  styleIsActive = (style: string) => {
    const firstListParent = this.firstListParent;
    if (
      firstListParent?.node.type === this.controller.schema.nodes.ordered_list
    ) {
      return firstListParent.node.attrs.style === style;
    } else {
      return false;
    }
  };
}
