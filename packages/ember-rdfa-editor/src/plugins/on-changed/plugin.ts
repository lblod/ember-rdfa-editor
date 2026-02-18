import { type EditorState, type Transaction } from 'prosemirror-state';
import { type PNode, ProsePlugin } from '#root/prosemirror-aliases.ts';
import { changedDescendants } from '#root/utils/_private/changed-descendants.ts';
import {
  IS_DRY_RUN,
  transactionCombinator,
  type TransactionMonad,
} from '#root/utils/transaction-utils.ts';

export const IS_ON_CHANGED = 'sayIsOnChanged';

export interface NodeSpecOnChanged {
  doOnce?: boolean;
  monadGenerator: (
    transactions: readonly Transaction[],
    oldState: EditorState,
    newState: EditorState,
  ) => TransactionMonad<unknown>[];
}

export const onChangedPlugin = new ProsePlugin<void>({
  appendTransaction(
    transactions: readonly Transaction[],
    oldState: EditorState,
    newState: EditorState,
  ) {
    let shouldSkip = false;
    for (const transaction of transactions) {
      if (
        transaction.getMeta(IS_DRY_RUN) ||
        (transaction.getMeta('appendedTransaction') as Transaction)?.getMeta(
          IS_DRY_RUN,
        ) ||
        transaction.getMeta(IS_ON_CHANGED) ||
        (transaction.getMeta('appendedTransaction') as Transaction)?.getMeta(
          IS_ON_CHANGED,
        )
      ) {
        shouldSkip = true;
      }
    }
    if (transactions.every((tr) => tr.steps.length === 0)) {
      shouldSkip = true;
    }

    if (shouldSkip) {
      return;
    }

    const collectedOnChanged: { type: string; onChanged: NodeSpecOnChanged }[] =
      [];
    changedDescendants(oldState.doc, newState.doc, 0, (node: PNode) => {
      if ('onChanged' in node.type.spec) {
        collectedOnChanged.push({
          type: node.type.name,
          onChanged: node.type.spec['onChanged'] as NodeSpecOnChanged,
        });
      }
    });
    const monads: TransactionMonad<unknown>[] = [];
    const handledTypes = new Set<string>();
    for (const { type, onChanged } of collectedOnChanged) {
      if (!onChanged.doOnce || !handledTypes.has(type)) {
        monads.push(
          ...onChanged.monadGenerator(transactions, oldState, newState),
        );
      }
      handledTypes.add(type);
    }
    if (monads.length > 0) {
      return transactionCombinator(newState, newState.tr, {
        [IS_ON_CHANGED]: true,
      })(monads).transaction;
    }
    return null;
  },
});
