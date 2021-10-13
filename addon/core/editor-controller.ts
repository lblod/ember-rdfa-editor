import Command from "@lblod/ember-rdfa-editor/core/command";
import {EditorEventListener, EditorEventName} from "@lblod/ember-rdfa-editor/core/event-bus";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import Editor from "@lblod/ember-rdfa-editor/core/editor";
import {InternalWidgetSpec, WidgetSpec} from "@lblod/ember-rdfa-editor/archive/utils/ce/raw-editor";
import {ModelRangeFactory, RangeFactory} from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";

export default interface EditorController {
  registerCommand<A extends unknown[], R>(command: new (model: EditorModel) => Command<A, R>): void;

  canExecuteCommand<A extends unknown[]>(commandName: string, ...args: A): boolean;

  executeCommand<A extends unknown[], R>(commandName: string, ...args: A): R | void;

  onEvent<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void;

  registerWidget(widget: WidgetSpec): void;

  get rangeFactory(): RangeFactory;

  get selection(): ModelSelection;

}

export class EditorControllerImpl implements EditorController {
  private editor: Editor;
  private name: string;
  private _rangeFactory: RangeFactory;

  constructor(name: string, editor: Editor) {
    this.name = name;
    this.editor = editor;
    this._rangeFactory = new ModelRangeFactory(this.editor.modelRoot);
  }

  get rangeFactory() {
    return this._rangeFactory;
  }

  get selection() {
    return this.editor.selection;
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

