import {
  CanExecuteArgs,
  CommandName,
  Commands,
  ExecuteArgs,
  ExecuteReturn,
} from '@lblod/ember-rdfa-editor';
import Transaction from '../core/transaction';
export type WrappedCommand<N extends CommandName> = {
  (args: ExecuteArgs<N>): ExecuteReturn<N>;
  canExecute: (args: CanExecuteArgs<N>) => boolean;
};
export type CommandExecutor = {
  [key in keyof Commands]: WrappedCommand<key>;
};
export default class CommandManager {}
export function wrapCommand<N extends CommandName>(
  name: N,
  command: Commands[N],
  transaction: Transaction
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wrapped = function (args: any) {
    return command.execute({ transaction }, args);
  } as WrappedCommand<N>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wrapped.canExecute = function (args: any) {
    return command.canExecute(transaction.workingCopy, args);
  };
  return [name, wrapped];
}

export function commandMapToCommandExecutor(
  commands: Partial<Commands>,
  transaction: Transaction
): CommandExecutor {
  const entries = Object.entries(commands) as [
    CommandName,
    Commands[CommandName]
  ][];
  const mapped = entries.map(([commandName, command]) =>
    wrapCommand(commandName, command, transaction)
  );
  return Object.fromEntries(mapped) as CommandExecutor;
}
