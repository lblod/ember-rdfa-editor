import InsertTextCommand from '@lblod/ember-rdfa-editor/commands/insert-text-command';
import { Dispatch } from '../core/editor';
import State from '../core/state';
import InsertNewLineCommand from './insert-newLine-command';

export type CommandMap = {
  'insert-text': InsertTextCommand;
  'insert-newLine': InsertNewLineCommand;
};
export type CommandName = keyof CommandMap;

export interface CommandContext {
  dispatch: Dispatch;
  state: State;
}

export default interface Command<A, R> {
  name: string;

  canExecute(context: CommandContext, args: A): boolean;

  execute(context: CommandContext, args: A): R;
}
