import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { type ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';
import { Command, type SayController } from '@lblod/ember-rdfa-editor';
import { clearBacklinks } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/clear-backlinks';
import { clearProperties } from '@lblod/ember-rdfa-editor/commands/_private/rdfa-commands/clear-properties';
import { Transaction } from 'prosemirror-state';

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

  addDeleteRangeTransaction = (tr: Transaction) => {
    return tr.deleteRange(
      this.node.pos,
      this.node.pos + this.node.value.nodeSize,
    );
  };

  deleteNodeCommand = () => {
    const clearBacklinksCommand = clearBacklinks({
      position: this.args.node.pos,
      callDispatchOnEarlyReturn: true,
    });
    const clearPropertiesCommand = clearProperties({
      position: this.args.node.pos,
      callDispatchOnEarlyReturn: true,
    });

    // I'm sure there is a better way to abstract this, but this will have to do for now
    const combinedCommand: Command = (state, dispatch) => {
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

            if (dispatch) {
              dispatch(clearBacklinksTransaction);
              dispatch(
                // Add delete range call on top of clear properties call
                this.addDeleteRangeTransaction(clearPropertiesTransaction),
              );
            }
          },
        );
      });
    };

    return combinedCommand;
  };

  deleteNode = () => {
    this.controller.doCommand(this.deleteNodeCommand());
  };
}
