import EventBus, {AnyEventName, EditorEventListener, ListenerConfig} from "@lblod/ember-rdfa-editor/core/event-bus";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel, {HtmlModel, ImmutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import {EditorEventName, EventWithName} from "@lblod/ember-rdfa-editor/core/editor-events";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import Query from "@lblod/ember-rdfa-editor/core/query";
import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";

export type WidgetLocation = "toolbar" | "sidebar" | "replace-text";

export interface WidgetSpec {
  identifier: string;
  componentName: string;
  desiredLocation: WidgetLocation;
}

export type InternalWidgetSpec = WidgetSpec & { controller: EditorController, plugin?: EditorPlugin };
/**
 * Container interface holding a {@link EditorModel} and exposing core editing API.
 */
export default interface Editor {
  executeCommand<A extends unknown[], R>(source: string, commandName: string, ...args: A): R | void;

  onEvent<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>, config: ListenerConfig): void;

  emitEvent<E extends AnyEventName>(event: EventWithName<E>): void;

  emitEventDebounced<E extends AnyEventName>(delayMs: number, event: EventWithName<E>): void;

  registerCommand<A extends unknown[], R>(command: { new(model: EditorModel, controller: EditorController): Command<A, R> }, controller: EditorController): void;

  canExecuteCommand<A extends unknown[]>(commandName: string, ...args: A): boolean;

  onDestroy(): void;

  registerWidget(widget: InternalWidgetSpec): void;

  registerQuery<A extends unknown[], R>(query: new (model: ImmutableModel) => Query<A, R>): void;

  executeQuery<A extends unknown[], R>(source: string, queryName: string, ...args: A): R | void;

  get widgetMap(): Map<WidgetLocation, WidgetSpec[]>;

  get modelRoot(): ModelElement;

  get viewRoot(): HTMLElement;

  get selection(): ModelSelection;
}

/**
 * Default implementation of {@link Editor} interface. A single instance of this
 * class is made per {@link RdfaEditor} component lifetime.
 */
export class EditorImpl implements Editor {
  protected model: EditorModel;
  private registeredCommands: Map<string, Command<unknown[], unknown>> = new Map<string, Command<unknown[], unknown>>();
  private registeredQueries: Map<string, Query<unknown[], unknown>> = new Map<string, Query<unknown[], unknown>>();
  private eventBus: EventBus;
  private _widgetMap: Map<WidgetLocation, InternalWidgetSpec[]> = new Map<WidgetLocation, InternalWidgetSpec[]>(
    [["toolbar", []], ["sidebar", []], ["replace-text", []]]
  );

  constructor(rootElement: HTMLElement) {
    this.eventBus = new EventBus();
    this.model = new HtmlModel(rootElement, this.eventBus);
  }

  get widgetMap() {
    return this._widgetMap;
  }

  get modelRoot(): ModelElement {
    return this.model.modelRoot;
  }

  get viewRoot(): HTMLElement {
    return this.model.viewRoot;
  }

  get selection(): ModelSelection {
    return this.model.selection;
  }

  executeCommand<A extends unknown[], R>(source: string, commandName: string, ...args: A): R | void {
    try {
      const command = this.getCommand(commandName);
      if (command.canExecute(...args)) {
        return command.execute(source, ...args) as R;
      }
    } catch (e) {
      console.error(e);
    }
  }

  private getCommand<A extends unknown[], R>(commandName: string): Command<A, R> {
    const command = this.registeredCommands.get(commandName) as Command<A, R>;
    if (!command) {
      throw new Error(`Unrecognized command ${commandName}`);
    }
    return command;
  }

  private getQuery<A extends unknown[], R>(queryName: string): Query<A, R> {
    const query = this.registeredQueries.get(queryName) as Query<A, R>;
    if (!query) {
      throw new Error(`Unrecognized query ${queryName}`);
    }
    return query;
  }

  onEvent<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void {
    this.eventBus.on(eventName, callback);
  }

  registerCommand<A extends unknown[], R>(command: { new(model: EditorModel, controller: EditorController): Command<A, R> }, controller: EditorController): void {
    const cmd = new command(this.model, controller);
    this.registeredCommands.set(cmd.name, cmd);
  }

  canExecuteCommand<A extends unknown[]>(commandName: string, ...args: A): boolean {
    return this.getCommand(commandName).canExecute(...args);
  }

  emitEvent<E extends AnyEventName>(event: EventWithName<E>) {
    this.eventBus.emit(event);
  }

  emitEventDebounced<E extends AnyEventName>(delayMs: number, event: EventWithName<E>) {
    this.eventBus.emitDebounced(delayMs, event);
  }


  onDestroy() {
    this.model.onDestroy();
  }

  registerWidget(widget: InternalWidgetSpec): void {
    this._widgetMap.get(widget.desiredLocation)!.push(widget);
  }

  executeQuery<A extends unknown[], R>(source: string, queryName: string, ...args: A): void | R {
    try {
      const query = this.getQuery(queryName);
      return query.execute(source, ...args) as R;
    } catch (e) {
      console.error(e);
    }
  }

  registerQuery<A extends unknown[], R>(query: { new(model: ImmutableModel): Query<A, R> }): void {
    const newQuery = new query(this.model);
    this.registeredQueries.set(newQuery.name, newQuery);
  }

}
