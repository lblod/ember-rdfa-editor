import Command from "@lblod/ember-rdfa-editor/commands/command";
import {AnyEventName, EditorEventListener, ListenerConfig} from "@lblod/ember-rdfa-editor/utils/event-bus";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import RawEditor from "@lblod/ember-rdfa-editor/utils/ce/raw-editor";
import {EditorPlugin} from "@lblod/ember-rdfa-editor/utils/editor-plugin";

export type WidgetLocation = "toolbar" | "sidebar";

export interface WidgetSpec {
  componentName: string;
  desiredLocation: WidgetLocation;
  plugin: EditorPlugin;
}

export type InternalWidgetSpec = WidgetSpec & {
  controller: Controller
};

export default interface Controller {
  get name(): string;

  get selection(): ModelSelection;

  executeCommand<A extends unknown[], R>(commandName: string, ...args: A): R | void;

  registerCommand<A extends unknown[], R>(command: Command<A, R>): void;

  registerWidget(spec: WidgetSpec): void;

  onEvent<E extends AnyEventName>(eventName: E, callback: EditorEventListener<E>, config?: ListenerConfig): void;

  offEvent<E extends AnyEventName>(eventName: E, callback: EditorEventListener<E>, config?: ListenerConfig): void;

}

export class RawEditorController implements Controller {
  private readonly _name: string;
  private readonly _rawEditor: RawEditor;

  constructor(name: string, rawEditor: RawEditor) {
    this._name = name;
    this._rawEditor = rawEditor;
  }

  get name(): string {
    return this._name;
  }

  get selection(): ModelSelection {
    return this._rawEditor.selection;
  }

  executeCommand<A extends unknown[], R>(commandName: string, ...args: A): R | void {
    return this._rawEditor.executeCommand(commandName, ...args);
  }

  offEvent<E extends AnyEventName>(eventName: E, callback: EditorEventListener<E>, config?: ListenerConfig): void {
    this._rawEditor.off(eventName, callback, config);
  }

  onEvent<E extends AnyEventName>(eventName: E, callback: EditorEventListener<E>, config?: ListenerConfig): void {
    this._rawEditor.on(eventName, callback, config);
  }

  registerCommand<A extends unknown[], R>(command: Command<A, R>): void {
    this._rawEditor.registerCommand(command);
  }

  registerWidget(_spec: WidgetSpec): void {
    this._rawEditor.registerWidget({..._spec, controller: this});
  }


}
