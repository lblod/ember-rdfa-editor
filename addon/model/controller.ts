import Command from "@lblod/ember-rdfa-editor/commands/command";
import {AnyEventName, EditorEventListener, ListenerConfig} from "@lblod/ember-rdfa-editor/utils/event-bus";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";

export interface WidgetSpec {
}

export default interface Controller {
  name: string;

  selection: ModelSelection;

  executeCommand<A, R>(commandName: string, args: A): R;

  registerCommand<A, R>(command: new() => Command<A, R>): void;

  registerWidget(spec: WidgetSpec): void;

  onEvent<E extends AnyEventName>(eventName: E, callback: EditorEventListener<E>, config?: ListenerConfig): void;

  offEvent<E extends AnyEventName>(eventName: E, callback: EditorEventListener<E>, config?: ListenerConfig): void;


}
