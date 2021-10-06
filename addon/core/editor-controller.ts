import Command from "@lblod/ember-rdfa-editor/core/command";
import {EditorEventListener, EditorEventName} from "@lblod/ember-rdfa-editor/archive/utils/event-bus";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import Editor from "@lblod/ember-rdfa-editor/core/editor";
import {InternalWidgetSpec, WidgetSpec} from "@lblod/ember-rdfa-editor/archive/utils/ce/raw-editor";

export default interface EditorController {
  registerCommand<A extends unknown[], R>(command: new (model: EditorModel) => Command<A, R>): void;

  canExecuteCommand<A extends unknown[]>(commandName: string, ...args: A): boolean;

  executeCommand<A extends unknown[], R>(commandName: string, ...args: A): R | void;

  onEvent<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void;

  registerWidget(widget: WidgetSpec): void;

}

export class EditorControllerImpl implements EditorController {
  private editor: Editor;
  private name: string;

  constructor(name: string, editor: Editor) {
    this.name = name;
    this.editor = editor;
  }

  canExecuteCommand<A extends unknown[]>(commandName: string, ...args: A): boolean {
    return this.editor.canExecuteCommand(commandName, ...args);

  }

  executeCommand<A extends unknown[], R>(commandName: string, ...args: A): R | void {
    return this.editor.executeCommand(this.name, commandName, ...args);
  }

  onEvent<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void {
    this.editor.onEvent(eventName, callback);
  }

  registerCommand<A extends unknown[], R>(command: { new(model: EditorModel): Command<A, R> }): void {
    this.editor.registerCommand(command);
  }

  registerWidget(widget: WidgetSpec): void {
    const internalSpec: InternalWidgetSpec = {...widget, controller: this};
    this.editor.registerWidget(internalSpec);

  }

}

