import State, {
  CommandArgs,
  CommandReturn,
  emptyState,
} from '@lblod/ember-rdfa-editor/core/state';
import { EditorPlugin, InitializedPlugin } from '../utils/editor-plugin';
import Transaction from './transaction';
import { View, EditorView } from './view';
import Command, {
  CommandMap,
  CommandName,
} from '@lblod/ember-rdfa-editor/commands/command';
import { CompatController } from '../model/controller';
import { getPathFromRoot } from '../utils/dom-helpers';
export type Dispatcher = (view: View, updateView?: boolean) => Dispatch;
export type Dispatch = (transaction: Transaction) => State;

export interface EditorArgs {
  domRoot: HTMLElement;
  plugins: EditorPlugin[];
  dispatcher?: Dispatcher;
  baseIRI?: string;
}

export interface Editor {
  state: State;
  view: View;

  executeCommand<C extends CommandName>(
    commandName: C,
    args: CommandArgs<C>,
    updateView?: boolean
  ): CommandReturn<C>;
  dispatchTransaction(tr: Transaction): void;
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
    const { domRoot } = args;
    this.view = new EditorView(domRoot);

    let initialState = emptyState();
    const tr = new Transaction(initialState);
    tr.readFromView(this.view);
    tr.setBaseIRI(args.baseIRI ?? document.baseURI);
    tr.setPathFromDomRoot(getPathFromRoot(domRoot, false));
    initialState = tr.apply();
    this.view.update(initialState);
    this._state = initialState;
    const dispatcher = args.dispatcher || this.defaultDispatcher;
    this.dispatchUpdate = dispatcher(this.view, true);
    this.dispatchNoUpdate = dispatcher(this.view, false);
  }

  executeCommand<C extends CommandName>(
    commandName: C,
    args: CommandArgs<C>,
    updateView = true
  ): CommandReturn<C> {
    const command: Command<CommandArgs<C>, CommandReturn<C>> = this.state
      .commands[commandName];
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
      if (updateView || transaction.needsToWrite) {
        view.update(this.state);
      }
      return this.state;
    };
  dispatchTransaction(tr: Transaction): void {
    this.dispatchUpdate(tr);
  }
}
async function initializePlugins(
  editor: Editor,
  plugins: EditorPlugin[]
): Promise<InitializedPlugin[]> {
  const result: InitializedPlugin[] = [];
  for (const plugin of plugins) {
    const controller = new CompatController(plugin.name, editor);
    await plugin.initialize(controller);
    const { initialize: _, ...rest } = plugin;
    result.push(rest);
  }
  return result;
}

export async function createEditor(args: EditorArgs): Promise<Editor> {
  const editor = new SayEditor(args);
  const initPlugins = await initializePlugins(editor, args.plugins);
  const tr = editor.state.createTransaction();
  tr.setPlugins(initPlugins);
  editor.dispatchUpdate(tr);
  return editor;
}
