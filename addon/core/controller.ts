import RawEditor, {WidgetSpec} from "@lblod/ember-rdfa-editor/utils/ce/raw-editor";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import EventBus, {EditorEventListener, EditorEventName} from "@lblod/ember-rdfa-editor/utils/event-bus";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import Command from "@lblod/ember-rdfa-editor/commands/command";
import {Model} from "@lblod/ember-rdfa-editor/core/model/model";

export interface Controller {

  get owner(): string;
  registerCommand(command: Command): void;
  executeCommand<A extends unknown[], R>(commandName: string, ...args: A): R;


}

export default class EditorController implements Controller{

  private readonly _owner: string;
  private readonly _editor: RawEditor;

  constructor(owner: string, model: Model) {
    this._owner = owner;
    this._editor = editor;
  }

  get owner(): string {
    return this._owner;
  }

  createFullDocumentRange(): ModelRange {
    return this._editor.createFullDocumentRange();
  }

  createSelection(): ModelSelection {
    return this._editor.createSelection();
  }

  collapseSelection(toLeft = false) {
    this._editor.model.selection.lastRange?.collapse(toLeft);
    this._editor.model.writeSelection();
  }

  on<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>) {
    EventBus.on(eventName, callback);
  }

  off<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>) {
    EventBus.off(eventName, callback);
  }

  registerWidget(widgetSpec: WidgetSpec) {
    this._editor.registerWidget(widgetSpec);
  }

  executeCommand(commandName: string, ...args: unknown[]): unknown {
    return this._editor.executeCommand_(this._owner, commandName, ...args);
  }

}
