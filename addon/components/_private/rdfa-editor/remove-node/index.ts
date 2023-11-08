import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { Command, PNode, type SayController } from '@lblod/ember-rdfa-editor';
import { type ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { clearBacklinks } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/clear-backlinks';
import { clearProperties } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/clear-properties';
import { Transaction } from 'prosemirror-state';
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

  addDeleteRangeTransaction = (tr: Transaction) => {
    return tr.deleteRange(
      this.node.pos,
      this.node.pos + this.node.value.nodeSize,
    );
  };

  clearBacklinksAndPropertiesCommand = (
    position: number,
    applyExtraTransaction?: (tr: Transaction) => Transaction,
  ): Command => {
    const clearBacklinksCommand = clearBacklinks({
      position,
      callDispatchOnEarlyReturn: true,
    });
    const clearPropertiesCommand = clearProperties({
      position,
      callDispatchOnEarlyReturn: true,
    });

    // I'm sure there is a better way to abstract this, but this will have to do for now
    return (state, dispatch) => {
      return clearBacklinksCommand(state, (clearBacklinksTransaction) => {
        // Take the state after clear backlinks call
        const { state: stateAfterClearBacklinks } = state.applyTransaction(
          clearBacklinksTransaction,
        );

        clearPropertiesCommand(
          // Provide the state after clear backlinks call to clear properties command
          stateAfterClearBacklinks,
          (clearPropertiesTransaction) => {
            // Mark backlink transaction as appended to clear properties transaction
            // So it will undo together with clear properties transaction
            // https://github.com/ProseMirror/prosemirror-history/blob/1.3.2/src/history.ts#L265
            clearPropertiesTransaction.setMeta(
              'appendedTransaction',
              clearBacklinksTransaction,
            );

            if (applyExtraTransaction) {
              applyExtraTransaction(clearPropertiesTransaction);
            }

            if (dispatch) {
              dispatch(clearBacklinksTransaction);
              dispatch(clearPropertiesTransaction);
            }
          },
        );
      });
    };
  };

  deleteNodeCommand = (position: number): Command => {
    return this.clearBacklinksAndPropertiesCommand(
      position,
      this.addDeleteRangeTransaction,
    );
  };

  deleteNode = () => {
    const childNodePositions = this.findAllRdfaNodeChildrenPositions(
      this.node.value,
    );

    childNodePositions.forEach((position) => {
      this.controller.doCommand(
        this.clearBacklinksAndPropertiesCommand(position),
      );
    });

    this.controller.doCommand(this.deleteNodeCommand(this.node.pos));
  };
}
