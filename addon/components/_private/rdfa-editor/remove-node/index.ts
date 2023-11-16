import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { type SayController } from '@lblod/ember-rdfa-editor';
import { type ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { removeRdfaNodesWithProperties } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands';

type Args = {
  node: ResolvedPNode;
  controller: SayController;
};

export default class RemoveNode extends Component<Args> {
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
    this.controller.doCommand(
      removeRdfaNodesWithProperties({ nodes: [this.node] }),
    );
  };
}
