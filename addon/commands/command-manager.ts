import {
  CanExecuteArgs,
  CommandName,
  Commands,
  ExecuteArgs,
  ExecuteReturn,
} from '@lblod/ember-rdfa-editor';
import Transaction from '../core/transaction';
export type CommandExecutor = {
  [key in keyof Commands]: {
    execute: (args: ExecuteArgs<key>) => ExecuteReturn<key>;
    canExecute: (args: CanExecuteArgs<key>) => boolean;
  };
};
export default class CommandManager {}
export function wrapCommand<N extends CommandName>(
  name: N,
  command: Commands[N],
  transaction: Transaction
) {
  return [
    name,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canExecute(args: any) {
        return command.canExecute(transaction.workingCopy, args);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      execute(args: any) {
        return command.execute({ transaction }, args);
      },
    },
  ];
}

export function commandMapToCommandExecutor(
  commands: Commands,
  transaction: Transaction
): CommandExecutor {
  const entries = Object.entries(commands) as [
    CommandName,
    Commands[CommandName]
  ][];
  const mapped = entries.map(([commandName, command]) => [
    commandName,
    {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      canExecute(args: any) {
        return command.canExecute(transaction.workingCopy, args);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      execute(args: any) {
        return command.execute({ transaction }, args);
      },
    },
  ]);
  return Object.fromEntries(mapped) as CommandExecutor;
}
