import Command from "@lblod/ember-rdfa-editor/core/command";
import {AnyEventName, EditorEventListener, EventListenerPriority} from "@lblod/ember-rdfa-editor/core/event-bus";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import Editor, {InternalWidgetSpec, WidgetSpec} from "@lblod/ember-rdfa-editor/core/editor";
import {ModelRangeFactory, RangeFactory} from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import {EditorEventName, EventWithName} from "@lblod/ember-rdfa-editor/core/editor-events";
import {RdfaContext, RdfaContextFactory} from "@lblod/ember-rdfa-editor/core/rdfa-context";

/**
 * Consumers (aka plugins or the host app) receive a controller instance as their interface to the editor.
 * Every consumer gets its own unique instance.
 * It has its own unique name, so any modification and event can be traced back to its originating controller.
 * This is crucial and the main reason for the existence of controllers.
 * This way, {@link EditorPlugin plugins} can safely listen to contentChange-type events
 * and modify the vdom in their handlers, cause they can easily filter out
 * change events that originate from their own changes, preventing infinite loops.
 */
export default interface EditorController {
  registerCommand<A extends unknown[], R>(command: new (model: EditorModel) => Command<A, R>): void;

  canExecuteCommand<A extends unknown[]>(commandName: string, ...args: A): boolean;

  executeCommand<A extends unknown[], R>(commandName: string, ...args: A): R | void;

  onEvent<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>, priority?: EventListenerPriority): void;

  onEventWithContext<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>, context: RdfaContext, priority?: EventListenerPriority): void;

  emitEvent<E extends AnyEventName>(event: EventWithName<E>): void;

  emitEventDebounced<E extends AnyEventName>(delayMs: number, event: EventWithName<E>): void;

  registerWidget(widget: WidgetSpec): void;

  get rangeFactory(): RangeFactory;

  get selection(): ModelSelection;

}

/**
 * Default implementation of {@link EditorController}.
 * Simply delegates most of its methods to an {@link Editor} instance, injecting
 * its own name where necessary.
 */
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

  onEvent<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>, priority: EventListenerPriority = "default"): void {
    this.editor.onEvent(eventName, callback, {priority});
  }

  onEventWithContext<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>, context: RdfaContext, priority: EventListenerPriority = "default") {
    this.editor.onEvent(eventName, callback, {priority, context: RdfaContextFactory.serialize(context)});
  }

  registerCommand<A extends unknown[], R>(command: { new(model: EditorModel): Command<A, R> }): void {
    this.editor.registerCommand(command);
  }

  registerWidget(widget: WidgetSpec): void {
    const internalSpec: InternalWidgetSpec = {...widget, controller: this};
    this.editor.registerWidget(internalSpec);
  }

  emitEvent<E extends AnyEventName>(event: EventWithName<E>): void {
    this.editor.emitEvent(event);
  }

  emitEventDebounced<E extends AnyEventName>(delayMs: number, event: EventWithName<E>): void {
    this.editor.emitEventDebounced(delayMs, event);
  }
}

