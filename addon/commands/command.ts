import Transaction from '@lblod/ember-rdfa-editor/core/transaction';
import InsertTextCommand from '@lblod/ember-rdfa-editor/commands/insert-text-command';

export type CommandMap = {
  'insert-text': InsertTextCommand;
};
export type CommandName = keyof CommandMap;

export interface CommandContext {
  transaction: Transaction;
}

export default interface Command<A, R> {
  name: string;

  canExecute(context: CommandContext, args: A): boolean;

  execute(context: CommandContext, args: A): R;
}
