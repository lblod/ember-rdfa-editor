import {
  type EditorState,
  type Plugin,
  type PluginKey,
  type Transaction,
} from 'prosemirror-state';

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

export const IS_DRY_RUN = 'sayIsDryRun';
/**
 * An object or map which holds metadata properties to be appended to transactions.
 * There is one special meta key 'sayIsDryRun', which is used to flag transactions which are just
 * being generated to check that they work, e.g. when checking a command.
 */
export type TransactionMeta =
  | ({
      [IS_DRY_RUN]?: boolean;
      // sayIsDryRun being boolean is only enforced for an object of string keyed metadata, as I
      // couldn't find a way to enforce it for a Map
    } & Omit<Record<string, unknown>, typeof IS_DRY_RUN>)
  | Map<string | Plugin | PluginKey, unknown>;

function setTransactionMeta(
  transaction: Transaction,
  meta?: TransactionMeta,
): void {
  if (meta instanceof Map) {
    meta.forEach((val, key) => {
      transaction.setMeta(key, val);
    });
  } else {
    meta &&
      Object.entries(meta).forEach(([key, val]) => {
        transaction.setMeta(key, val);
      });
  }
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
  /**
   * Metadata to be set on the transaction output from the monad
   */
  transactionMeta?: TransactionMeta,
) => TransactionMonadResult<R>;

export interface TransactionCombinatorResult<R>
  extends TransactionMonadResult<R[]> {
  /**
   * All the transactions that were applied in sequence to achieve this result, including any potential extra transactions from plugins.
   * This allows calling code to inspect and use any non-document state that may have been lost
   * such as selections, storedMarks and custom metadata
   */
  transactions: Transaction[];
}
/**
 * Builds a function that can chain {@link TransactionMonad} functions together.
 * It starts from the initial state given as the first parameter. The resulting combinator
 * then applies each monad function in sequence, ultimately generating one {@link TransactionCombinatorResult} which combines
 * all operations.
 *
 * You can also optionally pass an initialtransaction, which is required to be made from the same state you pass as initialState.
 * This initial transaction will simply be processed before the monads are applied. This is handy in commands, where you usually
 * already have a transaction and you don't realy want to be forced to write a monad function.
 *
 * The combination happens by appending all the steps of each transaction to an "accumulator" transaction, a bit similar to a
 * reduce function.
 *
 * WARNING: the combinator does NOT carry over any selection changes, storedMarks changes, or metadata changes from the given transactions.
 * The logic to correctly carry over selections was simply too complex. Instead, the return value carries the full array of transactions
 * that were applied in sequence, so that calling code can restore any potentially lost state if needed.
 * It is however recommended to write transactionMonads in such a way that they only deal with document transforms.
 *
 * @param initialState the state to start from
 * @param initialTransaction optional initial transaction. If given, it must be made from the same state as you pass to initialState
 * @param transactionMeta metadata to be set on the transactions produced by the combination process
 * @returns The resulting combinator
 */
export function transactionCombinator<R>(
  initialState: EditorState,
  initialTransaction?: Transaction,
  transactionMeta?: TransactionMeta,
) {
  return function (
    transactionMonads: TransactionMonad<R>[],
  ): TransactionCombinatorResult<R> {
    const tr = initialState.tr;
    const appliedTransactions: Transaction[] = [];
    if (initialTransaction) {
      for (const step of initialTransaction.steps) {
        tr.step(step);
      }
    }

    // Need to set metadata before applying transaction to a state
    setTransactionMeta(tr, transactionMeta);
    const { state, transactions } = initialState.applyTransaction(tr);
    let currentState = state;
    appliedTransactions.push(...transactions);
    const results: R[] = [];
    for (const monad of transactionMonads) {
      const { transaction, result } = monad(currentState, transactionMeta);
      // Need to set metadata before applying transaction to a state
      setTransactionMeta(transaction, transactionMeta);
      const { state, transactions } =
        currentState.applyTransaction(transaction);
      currentState = state;
      appliedTransactions.push(...transactions);

      results.push(result);
      for (const step of transaction.steps) {
        tr.step(step);
      }
    }
    return {
      transaction: tr,
      result: results,
      initialState,
      transactions: appliedTransactions,
    };
  };
}

/**
 * Creates a monad which applies the passed function to generate a list of monads based on the
 * incoming EditorState and applies them all.
 */
export function composeMonads(
  generator: (state: EditorState) => TransactionMonad<boolean>[],
): TransactionMonad<boolean> {
  return (state, transactionMeta) => {
    const monads: TransactionMonad<boolean>[] = generator(state);
    const {
      transactions: _,
      result,
      ...res
    } = transactionCombinator<boolean>(
      state,
      undefined,
      transactionMeta,
    )(monads);
    return { ...res, result: result.every(Boolean) };
  };
}
