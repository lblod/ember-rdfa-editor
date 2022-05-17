import State, { emptyState } from '@lblod/ember-rdfa-editor/core/state';
import { EditorPlugin } from '../utils/editor-plugin';
import Transaction from './transaction';
import { View, EditorView } from './view';
import { CommandName } from '@lblod/ember-rdfa-editor/commands/command';
export type Dispatch = (transaction: Transaction) => void;

export interface EditorArgs {
  domRoot: HTMLElement;
  plugins: EditorPlugin[];
  dispatch?: Dispatch;
}

export interface Editor {
  state: State;
  view: View;

  executeCommand(commandName: CommandName, args: unknown): unknown;
}

class SayEditor implements Editor {
  state: State;
  view: View;
  dispatch: Dispatch;

  constructor(args: EditorArgs) {
    const { domRoot, plugins } = args;
    this.view = new EditorView(domRoot);

    let initialState = emptyState();
    const tr = new Transaction(initialState);
    tr.setPlugins(plugins);
    tr.readFromView(this.view);
    initialState = tr.apply();
    this.view.update(initialState);
    this.state = initialState;
    this.dispatch = args.dispatch ?? this.defaultDispatch;
  }

  executeCommand(commandName: CommandName, args: unknown): unknown {
    const command = this.state.commands[commandName];
    const tr = new Transaction(this.state);
    const result = command.execute(
      {
        dispatch: this.dispatch,
        state: this.state,
      },
      args
    );
    return result;
  }
  defaultDispatch = (transaction: Transaction): void => {
    this.state = transaction.apply();
    this.view.update(this.state);
  };
}

export function createEditor(args: EditorArgs): Editor {
  return new SayEditor(args);
}
