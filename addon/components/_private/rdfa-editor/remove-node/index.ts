import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { type ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { type SayController } from '@lblod/ember-rdfa-editor';
import { clearBacklinks } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/clear-backlinks';
import { clearProperties } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/clear-properties';

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
    this.controller.doCommand(clearBacklinks({ position: this.args.node.pos }));
    this.controller.doCommand(
      clearProperties({ position: this.args.node.pos }),
    );

    this.controller.withTransaction((tr) => {
      return tr.deleteRange(
        this.node.pos,
        this.node.pos + this.node.value.nodeSize,
      );
    });
  };
}
