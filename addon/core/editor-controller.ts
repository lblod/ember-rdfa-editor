import Command from "@lblod/ember-rdfa-editor/core/command";
import {EditorEventListener, EditorEventName} from "@lblod/ember-rdfa-editor/archive/utils/event-bus";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import Editor from "@lblod/ember-rdfa-editor/core/editor";

export default interface EditorController {
  registerCommand<T extends Command>(command: new (model: EditorModel) => T): void;

  executeCommand<A extends unknown[], R>(commandName: string, ...args: A): R;

  onEvent<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void;

}

export class EditorControllerImpl implements EditorController {
  private editor: Editor;
  private name: string;

  constructor(name: string, editor: Editor) {
    this.name = name;
    this.editor = editor;
  }

  executeCommand<A extends unknown[], R>(commandName: string, ...args: A): R {
    return this.editor.executeCommand(this.name, commandName, ...args);
  }

  onEvent<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void {
    this.editor.onEvent(eventName, callback);
  }

  registerCommand<T extends Command>(command: { new(model: EditorModel): T }): void {
    this.editor.registerCommand(command);
  }

}

