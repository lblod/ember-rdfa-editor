import { EditorState, Transaction } from '@lblod/ember-rdfa-editor';

/**
 * A generic container for the result of a transaction monad
 * @template R The type of the result
 */
export interface TransactionMonadResult<R> {
  /**
   * The state that was passed to the monad
   */
  initialState: EditorState;
  /**
   * The resulting transaction
   */
  transaction: Transaction;
  /**
   * Whether the monad was successful, or any other extra result you might want to add
   */
  result: R;
}

/**
 * In simple terms, a transaction monad takes a state and builds a transaction and returns it.
 * We return a {@link TransactionMonadResult} here instead to allow for some flexibility regarding failure values.
 * It's generic in the result type, although it's most common to just use a boolean for a simple success/failure workflow.
 *
 * The reason for this particular shape is it's resemblance to monads from functional programming languages, which can be easily
 * chained. It's also relatively intuitive: start from a state, return what you wanna do with the state.
 *
 * By starting from a raw state instead of appending to a pre-existing transaction, these monads can be made much more generic
 * cause they can assume they start from a clean state and are in full control of the transaction they return (aka they don't need to
 * worry about previous steps)
 * @template R The result type for the {@link TransactionMonadResult} return value
 */
export type TransactionMonad<R> = (
  state: EditorState,
) => TransactionMonadResult<R>;

/**
 * Builds a function that can chain {@link TransactionMonad} functions together.
 * It starts from the initial state given as the first parameter. The resulting combinator
 * then applies each monad function in sequence, ultimately generating one {@link TransactionMonadResult} which combines
 * all operations.
 *
 * You can also optionally pass an initialtransaction, which is required to be made from the same state you pass as initialState.
 * This initial transaction will simply be processed before the monads are applied. This is handy in commands, where you usually
 * already have a selection and you don't realy want to be forced to write a monad function.
 *
 * The combination happens by appending all the steps of each transaction to an "accumulator" transaction, a bit similar to a
 * reduce function. There is also some logic to handle explicitly set selections, as they're a bit special since they assume to
 * be associated with the "doc" of a transaction, which is the document state after all the steps have run.
 * Here we map the selection of each transaction through all the steps (to re-associate it with the correct doc state), and then use that
 * as the selection for our accumulator. This means that later transactions clobber previous ones in terms of their selection, but there's no
 * way around that (since there can only ever be one selection).
 *
 * This being said, it is still recommended to only mess with selections _after_ running the combinator, cause mapping selections is not
 * a perfect process.
 * @param initialState the state to start from
 * @param initialTransaction optional initial transaction. If given, it must be made from the same state as you pass to initialState
 * @returns The resulting combinator
 */
export function transactionCombinator<R>(
  initialState: EditorState,
  initialTransaction?: Transaction,
) {
  return function (
    transactionMonads: TransactionMonad<R>[],
  ): TransactionMonadResult<R[]> {
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
