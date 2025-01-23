import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';

import { type SayController } from '#root';
import { type ResolvedPNode } from '#root/utils/_private/types.ts';

type Args = {
  node: ResolvedPNode;
  controller: SayController;
};

export default class RemoveNode extends Component<Args> {
  AlertTriangleIcon = AlertTriangleIcon;

  @tracked showDialog = false;

  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node;
  }

  showConfirmationDialog = () => {
    this.showDialog = true;
  };

  closeConfirmationDialog = () => {
    this.showDialog = false;
  };

  confirmDelete = () => {
    this.deleteNode();
    this.closeConfirmationDialog();
  };

  deleteNode = () => {
    this.controller.withTransaction((tr) => {
      return tr.deleteRange(
        this.node.pos,
        this.node.pos + this.node.value.nodeSize,
      );
    });
  };

  get enabled() {
    return this.args.node.pos !== -1;
  }
}
