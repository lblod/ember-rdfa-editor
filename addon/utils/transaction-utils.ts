import { EditorState, Transaction } from '@lblod/ember-rdfa-editor';
export interface TransactionResult<R> {
  initialState: EditorState;
  transaction: Transaction;
  result: R;
}

export type TransactionMonad<R> = (state: EditorState) => TransactionResult<R>;

export function transactionCombinator<R>(
  initialState: EditorState,
  initialTransaction?: Transaction,
) {
  return function (
    transactionMonads: TransactionMonad<R>[],
  ): TransactionResult<R[]> {
    const tr = initialState.tr;
    if (initialTransaction) {
      for (const step of initialTransaction.steps) {
        tr.step(step);
      }
      if (initialTransaction.selectionSet) {
        tr.setSelection(initialTransaction.selection.map(tr.doc, tr.mapping));
      }
    }
    let state = initialState.apply(tr);
    const results: R[] = [];
    for (const monad of transactionMonads) {
      const { transaction, result } = monad(state);
      state = state.apply(transaction);
      results.push(result);
      for (const step of transaction.steps) {
        tr.step(step);
      }
      if (transaction.selectionSet) {
        tr.setSelection(transaction.selection.map(tr.doc, tr.mapping));
      }
    }
    return { transaction: tr, result: results, initialState };
  };
}
