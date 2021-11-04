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

  private listeners: Map<EditorEventName, Array<EditorEventListener<EditorEventName>>> = new Map<EditorEventName, Array<EditorEventListener<EditorEventName>>>();
  private logger: Logger = createLogger("EventBus");

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

  emit<E extends EditorEventName>(eventName: E, payload: EDITOR_EVENT_MAP[E]): void {
    const eventListeners = this.listeners.get(eventName);
    this.logger.log(`Emitting event: ${eventName} with payload:`, payload);
    if (eventListeners) {
      eventListeners.forEach(listener => listener({name: eventName, payload}));
    }
  }
}
