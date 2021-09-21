import RawEditor, {WidgetSpec} from "@lblod/ember-rdfa-editor/utils/ce/raw-editor";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import EventBus, {EditorEventListener, EditorEventName} from "@lblod/ember-rdfa-editor/utils/event-bus";

export default class EditorController {

  private readonly _owner: string;
  private readonly _editor: RawEditor;

  constructor(owner: string, editor: RawEditor) {
    this._owner = owner;
    this._editor = editor;
  }

  get owner(): string {
    return this._owner;
  }

  createFullDocumentRange(): ModelRange {
    return this._editor.createFullDocumentRange();
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

  executeCommand(commandName: string, ...args: unknown[]) {
    this._editor.executeCommand(this._owner, commandName, ...args);
  }

}
