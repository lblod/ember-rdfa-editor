import State, { emptyState } from '@lblod/ember-rdfa-editor/core/state';
import { EditorPlugin } from '../utils/editor-plugin';
import Transaction from './transaction';
import { View, EditorView } from './view';
import { CommandName } from '@lblod/ember-rdfa-editor/commands/command';
export type Dispatcher = (view: View, updateView?: boolean) => Dispatch;
export type Dispatch = (transaction: Transaction) => State;

export interface EditorArgs {
  domRoot: HTMLElement;
  plugins: EditorPlugin[];
  dispatcher?: Dispatcher;
}

export interface Editor {
  state: State;
  view: View;

  executeCommand(
    commandName: CommandName,
    args: unknown,
    updateView?: boolean
  ): unknown;
}

class SayEditor implements Editor {
  private _state: State;
  view: View;
  dispatchUpdate: Dispatch;
  dispatchNoUpdate: Dispatch;
  get state(): State {
    return this._state;
  }
  set state(value: State) {
    console.log('Setting state', value.document.toXml());
    this._state = value;
  }

  constructor(args: EditorArgs) {
    const { domRoot, plugins } = args;
    this.view = new EditorView(domRoot);

    let initialState = emptyState();
    const tr = new Transaction(initialState);
    tr.setPlugins(plugins);
    tr.readFromView(this.view);
    initialState = tr.apply();
    this.view.update(initialState);
    this._state = initialState;
    const dispatcher = args.dispatcher || this.defaultDispatcher;
    this.dispatchUpdate = dispatcher(this.view, true);
    this.dispatchNoUpdate = dispatcher(this.view, false);
  }

  executeCommand(
    commandName: CommandName,
    args: unknown,
    updateView = true
  ): unknown {
    const command = this.state.commands[commandName];
    const result = command.execute(
      {
        dispatch: updateView ? this.dispatchUpdate : this.dispatchNoUpdate,
        state: this.state,
      },
      args
    );
    return result;
  }
  defaultDispatcher =
    (view: View, updateView = true) =>
    (transaction: Transaction): State => {
      this.state = transaction.apply();
      if (updateView) {
        view.update(this.state);
      }
      return this.state;
    };
}

export function createEditor(args: EditorArgs): Editor {
  return new SayEditor(args);
}
