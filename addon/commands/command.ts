import State from '../core/state';
import Transaction from '../core/transaction';

export interface CommandContext {
  transaction: Transaction;
}

/**
 * Represents an editing action at the highest level, and are built on top of the @link{Transaction} primitive.
 * You can think of it this way:
 * if a series of edits made with transactions would be a private script,
 * turning them into a command would be to turn that script into a real, published package
 *
 * Emacs users might also consider them "interactive" functions as opposed to non-interactive ones.
 *
 * Essentially commands are the answer to the question "Hey editor, what can you do?"
 * Whereas transactions are the answer to the followup question "Ah but what if I wanted to do _this other thing_?"
 *
 * You may encounter commands that do not follow this logic, that's because commands predate
 * this insight.
 * */
export default interface Command<A, R> {
  canExecute(state: State, args: A): boolean;

  execute(context: CommandContext, args: A): R;
}
