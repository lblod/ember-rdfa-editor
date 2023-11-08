import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { Transaction } from 'prosemirror-state';

import { PNode, type SayController } from '@lblod/ember-rdfa-editor';
import { type ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { clearBacklinksTransaction } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/clear-backlinks';
import { clearPropertiesTransaction } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/clear-properties';
import { getNodeByRdfaId } from '@lblod/ember-rdfa-editor/plugins/rdfa-info';

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

  findAllRdfaNodeChildrenPositions = (node: PNode) => {
    const resolvedChildrenPositions: number[] = [];

    node.forEach((child) => {
      if (child.type.spec.attrs?.['rdfaNodeType']) {
        const resolvedPos = getNodeByRdfaId(
          this.controller.activeEditorState,
          child.attrs?.['__rdfaId'],
        )?.pos;

        if (resolvedPos) {
          resolvedChildrenPositions.push(resolvedPos);
        }

        resolvedChildrenPositions.push(
          ...this.findAllRdfaNodeChildrenPositions(child),
        );
      }
    });

    return resolvedChildrenPositions;
  };

  clearBacklinksAndPropertiesTransaction = ({
    position,
    transaction,
  }: {
    position: number;
    transaction: Transaction;
  }) => {
    clearPropertiesTransaction({
      state: this.controller.activeEditorState,
      position,
    })(transaction);
    clearBacklinksTransaction({
      state: this.controller.activeEditorState,
      position,
    })(transaction);
  };

  deleteNodeTransaction = ({
    position,
    transaction,
  }: {
    position: number;
    transaction: Transaction;
  }) => {
    this.clearBacklinksAndPropertiesTransaction({
      position,
      transaction,
    });
    this.deleteRangeTransaction(transaction);
  };

  deleteRangeTransaction = (transaction: Transaction) => {
    return transaction.deleteRange(
      this.node.pos,
      this.node.pos + this.node.value.nodeSize,
    );
  };

  deleteNode = () => {
    const childNodePositions = this.findAllRdfaNodeChildrenPositions(
      this.node.value,
    );

    this.controller.withTransaction((transaction) => {
      childNodePositions.forEach((position) => {
        this.clearBacklinksAndPropertiesTransaction({
          position,
          transaction,
        });
      });

      this.deleteNodeTransaction({
        position: this.node.pos,
        transaction: transaction,
      });

      return transaction;
    });
  };
}
