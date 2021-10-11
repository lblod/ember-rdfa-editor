import {debouncedAdjustable} from "@lblod/ember-rdfa-editor/archive/utils/debounce";
import {CORE_OWNER} from "@lblod/ember-rdfa-editor/util/constants";

export abstract class EditorEvent<P> {
  abstract _name: EditorEventName;

  protected constructor(private _payload: P, private _owner = CORE_OWNER) {
  }

  get payload(): P {
    return this._payload;
  }

  get name(): EditorEventName {
    return this._name;
  }

  get owner(): string {
    return this._owner;
  }

  set owner(value: string) {
    this._owner = value;
  }
}

export abstract class VoidEvent extends EditorEvent<void> {
  constructor(owner = CORE_OWNER) {
    super(undefined, owner);
  }
}

export class DummyEvent extends VoidEvent {
  _name: EditorEventName = "dummy";
}

export class ContentChangedEvent extends VoidEvent {
  _name: EditorEventName = "contentChanged";
}

export class SelectionChangedEvent extends VoidEvent {
  _name: EditorEventName = "selectionChanged";
}

export class ModelWrittenEvent extends VoidEvent {
  _name: EditorEventName = "modelWritten";
}
export class KeydownEvent extends EditorEvent<KeyboardEvent> {
  _name: EditorEventName = "keyDown";
  constructor(payload: KeyboardEvent, owner: string) {
    super(payload, owner);
  }
}

export type EDITOR_EVENT_MAP = {
  "dummy": DummyEvent,
  "contentChanged": ContentChangedEvent,
  "modelWritten": ModelWrittenEvent,
  "selectionChanged": SelectionChangedEvent
  "keyDown": KeydownEvent
};
export type EditorEventName = keyof EDITOR_EVENT_MAP;

export type EditorEventListener<E extends EditorEventName> = (event: EDITOR_EVENT_MAP[E]) => void;

export type EventEmitter<E extends EditorEventName> = (event: EDITOR_EVENT_MAP[E]) => void;

export type DebouncedEmitter<E extends EditorEventName> = (delayMs: number, event: EDITOR_EVENT_MAP[E]) => void;

export default class EventBus {

  private listeners: Map<EditorEventName, Array<EditorEventListener<EditorEventName>>> = new Map<EditorEventName, Array<EditorEventListener<EditorEventName>>>();
  private debouncedEmitters: Map<EditorEventName, DebouncedEmitter<EditorEventName>> = new Map();

  on<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.push(callback);
    } else {
      this.listeners.set(eventName, [callback]);
    }
  }

  off<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }

  }

  emit = <E extends EditorEventName>(event: EDITOR_EVENT_MAP[E]): void => {
    const eventListeners = this.listeners.get(event.name);

    console.log(`${event.owner} is emitting event: ${event.name} with payload:`, event.payload);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(event));
    }
  };

  emitDebounced = <E extends EditorEventName>(delayMs: number, event: EDITOR_EVENT_MAP[E]): void => {

    const emitter = this.debouncedEmitters.get(event.name);
    if (emitter) {
      emitter(delayMs, event);
    } else {
      const emitter = debouncedAdjustable(this.emit);
      this.debouncedEmitters.set(event.name, emitter);
      emitter(delayMs, event);
    }

  };
}
