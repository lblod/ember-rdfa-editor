import Command, {
  CommandMap,
  CommandName,
} from '@lblod/ember-rdfa-editor/commands/command';
import State, {
  CommandArgs,
  CommandReturn,
  emptyState,
} from '@lblod/ember-rdfa-editor/core/state';
import { EditorController } from '../model/controller';
import { CORE_OWNER } from '../model/util/constants';
import { getPathFromRoot } from '../utils/dom-helpers';
import {
  ContentChangedEvent,
  EventWithName,
  SelectionChangedEvent,
} from '../utils/editor-event';
import { EditorPlugin, InitializedPlugin } from '../utils/editor-plugin';
import EventBus, {
  AnyEventName,
  EditorEventListener,
  ListenerConfig,
} from '../utils/event-bus';
import Transaction from './transaction';
import { EditorView, View } from './view';
export type Dispatcher = (view: View, updateView?: boolean) => Dispatch;
export type Dispatch = (transaction: Transaction) => State;

export interface EditorArgs {
  /**
   * The element the editor will render in
   * */
  domRoot: HTMLElement;
  /**
   * The plugins that should be active from the start of the editor
   * */
  plugins: EditorPlugin[];
  /**
   * A higher-order function returning a dispatch function, to be used in place of the default.
   * Likely only needed for advanced usecases. The dispatch function takes in a transaction
   * and is expected to update the editor state and if needed update the view.
   * */
  dispatcher?: Dispatcher;
  /**
   * The base IRI used for all rdfa subjects that don't explicitly specify an absolute IRI.
   * Will be inferred from the document if not provided.
   * */
  baseIRI?: string;
}

/**
 * The editor interface represents the outermost container. For every editable document on the page,
 * there will be one Editor instance.
 * */
export interface Editor {
  /**
   * Represents the currently active state of the editor.
   * */
  state: State;
  view: View;

  /**
   * Executes a {@link Command} by name. Command will recieve the editor's current state
   * as part of its context argument.
   * */
  executeCommand<C extends CommandName>(
    commandName: C,
    args: CommandArgs<C>,
    updateView?: boolean
  ): CommandReturn<C> | void;
  /**
   * Checks if the @{link Command} with name can be executed for the given args.
   * */
  canExecuteCommand<N extends keyof CommandMap>(
    commandName: N,
    args: CommandArgs<N>
  ): boolean;
  /**
   * Low-level way to dispatch a given transaction.
   * @argument tr The transaction to be dispatched
   * @argument updateView Whether or not the view needs to be updated after updating the editor state.
   * */
  dispatchTransaction(tr: Transaction, updateView?: boolean): void;
  /**
   * @deprecated
   * Emits an event on the eventbus. This mechanism will be replaced (or at least mostly replaced) by a transaction-passing mechanism
   * and is mainly provided for backwards compatibility
   * */
  emitEvent<E extends AnyEventName>(event: EventWithName<E>): void;
  /**
   * @deprecated
   * Register an event listener
   * */
  onEvent<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  );
  /**
   * @deprecated
   * Unregister an event listener
   * */
  offEvent<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  );
}

/**
 * Default implementation of the editor interface. Is a class for convenience and clearer `this` semantics.
 * */
class SayEditor implements Editor {
  private _state: State;
  view: View;
  dispatchUpdate: Dispatch;
  dispatchNoUpdate: Dispatch;
  eventbus: EventBus;

  constructor(args: EditorArgs) {
    const { domRoot } = args;
    this.view = new EditorView(domRoot);
    this.eventbus = new EventBus();

    let initialState = emptyState(this.eventbus);
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

  get state(): State {
    return this._state;
  }
  set state(value: State) {
    console.log('Setting state', value.document.toXml());
    this._state = value;
  }
  executeCommand<C extends CommandName>(
    commandName: C,
    args: CommandArgs<C>,
    updateView = true
  ): CommandReturn<C> | void {
    const command: Command<CommandArgs<C>, CommandReturn<C> | void> = this.state
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
  canExecuteCommand<C extends keyof CommandMap>(
    commandName: C,
    args: CommandArgs<C>
  ): boolean {
    const command: Command<CommandArgs<CommandName>, CommandReturn<C>> = this
      .state.commands[commandName];
    return command.canExecute({ state: this.state }, args);
  }
  defaultDispatcher =
    (view: View, updateView = true) =>
    (transaction: Transaction): State => {
      const newState = transaction.apply();
      this.state = newState;
      if (updateView || transaction.needsToWrite) {
        view.update(this.state);
      }
      if (!newState.document.sameAs(transaction.initialState.document)) {
        this.emitEvent(
          new ContentChangedEvent({
            owner: CORE_OWNER,
            payload: { type: 'unknown', rootModelNode: newState.document },
          })
        );
      }
      if (!newState.selection.sameAs(transaction.initialState.selection)) {
        this.emitEvent(
          new SelectionChangedEvent({
            owner: CORE_OWNER,
            payload: newState.selection,
          })
        );
      }

      return this.state;
    };
  dispatchTransaction(tr: Transaction, updateView = true): void {
    if (updateView) {
      this.dispatchUpdate(tr);
    } else {
      this.dispatchNoUpdate(tr);
    }
  }
  emitEvent<E extends string>(event: EventWithName<E>): void {
    this.eventbus.emit(event);
  }
  onEvent<E extends string>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ) {
    this.eventbus.on(eventName, callback, config);
  }
  offEvent<E extends string>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ) {
    this.eventbus.off(eventName, callback, config);
  }
}
/**
 * Before use, plugins need to be initialized, which provides them with the controller
 * they need to interact with the editor. Since plugins often interact with backends,
 * this is async.
 * */
async function initializePlugins(
  editor: Editor,
  plugins: EditorPlugin[]
): Promise<InitializedPlugin[]> {
  const result: InitializedPlugin[] = [];
  for (const plugin of plugins) {
    const controller = new EditorController(plugin.name, editor);
    await plugin.initialize(controller);
    const { initialize: _, ...rest } = plugin;
    result.push(rest);
  }
  return result;
}

/**
 * Creates an editor and initializes the initial plugins
 * */
export async function createEditor(args: EditorArgs): Promise<Editor> {
  const editor = new SayEditor(args);
  const initPlugins = await initializePlugins(editor, args.plugins);
  const tr = editor.state.createTransaction();
  tr.setPlugins(initPlugins);
  editor.dispatchUpdate(tr);
  return editor;
}
