import State, { emptyState } from '@lblod/ember-rdfa-editor/core/state';
import { EditorPlugin } from '../utils/editor-plugin';
import Transaction from './transaction';
import { View, EditorView } from './view';
import { CommandName } from '@lblod/ember-rdfa-editor/commands/command';

export interface EditorArgs {
  domRoot: HTMLElement;
  plugins: EditorPlugin[];
}

export interface Editor {
  state: State;
  view: View;

  executeCommand(commandName: CommandName, args: unknown): unknown;
}

class SayEditor implements Editor {
  state: State;
  view: View;

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
  }

  executeCommand(commandName: CommandName, args: unknown): unknown {
    const command = this.state.commands[commandName];
    const tr = new Transaction(this.state);
    const result = command.execute(
      {
        transaction: tr,
      },
      args
    );
    this.state = tr.apply();
    this.view.update(this.state);
    return result;
  }
}

export function createEditor(args: EditorArgs): Editor {
  return new SayEditor(args);
}
