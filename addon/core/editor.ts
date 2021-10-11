import EventBus, {
  EDITOR_EVENT_MAP,
  EditorEventListener,
  EditorEventName
} from "@lblod/ember-rdfa-editor/archive/utils/event-bus";
import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel, {HtmlModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import {InternalWidgetSpec, WidgetLocation, WidgetSpec} from "@lblod/ember-rdfa-editor/archive/utils/ce/raw-editor";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";

export default interface Editor {
  executeCommand<A extends unknown[], R>(source: string, commandName: string, ...args: A): R | void;

  onEvent<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void;

  emitEvent<E extends EditorEventName>(event: EDITOR_EVENT_MAP[E]): void;

  registerCommand<A extends unknown[], R>(command: { new(model: EditorModel): Command<A, R> }): void;

  canExecuteCommand<A extends unknown[]>(commandName: string, ...args: A): boolean;

  onDestroy(): void;

  registerWidget(widget: InternalWidgetSpec): void;

  get widgetMap(): Map<WidgetLocation, WidgetSpec[]>;

  get modelRoot(): ModelElement;

  get viewRoot(): HTMLElement;

  get selection(): ModelSelection;
}

export class EditorImpl implements Editor {
  private model: EditorModel;
  private registeredCommands: Map<string, Command<unknown[], unknown>> = new Map<string, Command<unknown[], unknown>>();
  private eventBus: EventBus;
  private _widgetMap: Map<WidgetLocation, InternalWidgetSpec[]> = new Map<WidgetLocation, InternalWidgetSpec[]>(
    [["toolbar", []], ["sidebar", []]]
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

  onEvent<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void {
    this.eventBus.on(eventName, callback);
  }

  registerCommand<A extends unknown[], R>(command: { new(model: EditorModel): Command<A, R> }): void {
    const cmd = new command(this.model);
    this.registeredCommands.set(cmd.name, cmd);
  }

  canExecuteCommand<A extends unknown[]>(commandName: string, ...args: A): boolean {
    return this.getCommand(commandName).canExecute(...args);
  }

  emitEvent<E extends EditorEventName>(event: EDITOR_EVENT_MAP[E]) {
    this.eventBus.emit(event);
  }

  onDestroy() {
    this.model.onDestroy();
  }

  registerWidget(widget: InternalWidgetSpec): void {
    this._widgetMap.get(widget.desiredLocation)!.push(widget);
  }

}
