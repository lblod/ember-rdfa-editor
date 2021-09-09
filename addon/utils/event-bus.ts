import {createLogger, Logger} from "@lblod/ember-rdfa-editor/utils/logging-utils";

export interface EditorEvent<E extends EditorEventName> {
  name: E,
  payload: EDITOR_EVENT_MAP[E]
}

export type EDITOR_EVENT_MAP = {
  "contentChanged": void
};
export type EditorEventName = keyof EDITOR_EVENT_MAP;

export type EditorEventListener<E extends EditorEventName> = (event: EditorEvent<E>) => void;

export default class EventBus {
  static instance: EventBus;

  private static getInstance() {
    if (!this.instance) {
      this.instance = new EventBus();
    }
    return this.instance;
  }

  static on<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void {
    this.getInstance().on(eventName, callback);
  }

  static off<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void {
    this.getInstance().off(eventName, callback);
  }

  // TODO: figure out how to allow void events to omit the payload argument
  static emit<E extends EditorEventName>(eventName: E, payload: EDITOR_EVENT_MAP[E]): void {
    this.getInstance().emit(eventName, payload);
  }

  // TODO: figure out how to allow void events to omit the payload argument
  static emitDebounced<E extends EditorEventName>(delayMs: number, eventName: E, payload: EDITOR_EVENT_MAP[E]): void {
    const debouncedEmit = debounced(EventBus.emit, delayMs);
    debouncedEmit(eventName, payload);
  }

  private listeners: Map<EditorEventName, Array<EditorEventListener<EditorEventName>>> = new Map<EditorEventName, Array<EditorEventListener<EditorEventName>>>();
  private logger: Logger = createLogger("EventBus");

  private on<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.push(callback);
    } else {
      this.listeners.set(eventName, [callback]);
    }
  }

  private off<E extends EditorEventName>(eventName: E, callback: EditorEventListener<E>): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }

  }

  private emit<E extends EditorEventName>(eventName: E, payload: EDITOR_EVENT_MAP[E]): void {
    const eventListeners = this.listeners.get(eventName);
    this.logger.log(`Emitting event: ${eventName} with payload:`, payload);
    if (eventListeners) {
      eventListeners.forEach(listener => listener({name: eventName, payload}));
    }
  }
}
