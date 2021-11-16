import Command from "@lblod/ember-rdfa-editor/commands/command";
import {AnyEventName, EditorEventListener, ListenerConfig} from "@lblod/ember-rdfa-editor/utils/event-bus";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import RawEditor from "@lblod/ember-rdfa-editor/utils/ce/raw-editor";
import {EditorPlugin} from "@lblod/ember-rdfa-editor/utils/editor-plugin";
import {ModelRangeFactory, RangeFactory} from "@lblod/ember-rdfa-editor/model/model-range";
import Datastore, {EditorStore} from "@lblod/ember-rdfa-editor/model/util/datastore";

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

  get rangeFactory(): RangeFactory;

  executeCommand<A extends unknown[], R>(commandName: string, ...args: A): R | void;

  registerCommand<A extends unknown[], R>(command: Command<A, R>): void;

  registerWidget(spec: WidgetSpec): void;

  onEvent<E extends AnyEventName>(eventName: E, callback: EditorEventListener<E>, config?: ListenerConfig): void;

  offEvent<E extends AnyEventName>(eventName: E, callback: EditorEventListener<E>, config?: ListenerConfig): void;

}

export class RawEditorController implements Controller {
  private readonly _name: string;
  protected readonly _rawEditor: RawEditor;
  private _rangeFactory: RangeFactory;
  private dataStore: Datastore;

  constructor(name: string, rawEditor: RawEditor) {
    this._name = name;
    this._rawEditor = rawEditor;
    this._rangeFactory = new ModelRangeFactory(this._rawEditor.rootModelNode);
    this.dataStore = new EditorStore();
  }

  get name(): string {
    return this._name;
  }

  get selection(): ModelSelection {
    return this._rawEditor.selection;
  }

  get rangeFactory(): RangeFactory {
    return this._rangeFactory;
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
