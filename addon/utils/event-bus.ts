import {CustomEditorEvent, EDITOR_EVENT_MAP, EventWithName} from "@lblod/ember-rdfa-editor/utils/editor-event";
import {debouncedAdjustable} from "@lblod/ember-rdfa-editor/utils/debounce";

export type EditorEventName = keyof EDITOR_EVENT_MAP;


export type AnyEventName = EditorEventName | string;
export type EditorEventListener<E extends AnyEventName> = (event: EventWithName<E>) => void;
export type DebouncedEmitter<E extends AnyEventName> = (delayMs: number, event: EventWithName<E>) => void;
export const eventListenerPriorities: EventListenerPriority[] = ["highest", "high", "default", "low", "lowest", "internal"];
export type EventListenerPriority = "highest" | "high" | "default" | "low" | "lowest" | "internal";

export interface ListenerConfig {
  priority?: EventListenerPriority,
  context?: string
}

export default class EventBus {
  private listeners: Map<AnyEventName, PriorityListenerQueue<AnyEventName>> = new Map<EditorEventName, PriorityListenerQueue<EditorEventName>>();
  private debouncedEmitters: Map<AnyEventName, DebouncedEmitter<AnyEventName>> = new Map();

  on<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    {
      priority = "default",
    }: ListenerConfig = {}): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.addListener(callback, priority);

    } else {
      const newQueue = new PriorityListenerQueue<AnyEventName>();
      newQueue.addListener(callback, priority);
      this.listeners.set(eventName, newQueue);
    }
  }

  off<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    {
      priority = "default",
    }: ListenerConfig = {}): void {
    const listenerQueue = this.listeners.get(eventName);
    if (listenerQueue) {
      listenerQueue.removeListener(callback, priority);
    }
  }

  emit = <E extends AnyEventName>(event: EventWithName<E>): void => {
    const listenerQueue = this.listeners.get(event.name);

    console.debug(`${event.owner} is emitting event: ${event.name} with payload:`, event.payload);
    if (listenerQueue) {
      listenerQueue.propagate(event);
    }
  };
  emitCustom = <P>(event: CustomEditorEvent<P>) => {
    this.emit<string>(event);
  };

  emitDebounced = <E extends AnyEventName>(delayMs: number, event: EventWithName<E>): void => {

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

class PriorityListenerQueue<E extends AnyEventName> {
  private listeners: Map<EventListenerPriority, EditorEventListener<E>[]> = new Map<EventListenerPriority, EditorEventListener<E>[]>();


  addListener(listener: EditorEventListener<E>, priority: EventListenerPriority) {
    const queue = this.listeners.get(priority);
    if (!queue) {
      this.listeners.set(priority, [listener]);
    } else {
      queue.splice(0, 0, listener);
    }
  }

  removeListener(listener: EditorEventListener<E>, priority: EventListenerPriority) {
    const queue = this.listeners.get(priority);
    if (queue) {
      const index = queue.indexOf(listener);
      queue.splice(index, 1);
    }
  }

  propagate(event: EventWithName<E>) {
    for (const prio of eventListenerPriorities) {
      const queue = this.listeners.get(prio);
      if (queue) {
        for (const listener of queue) {
          if (event.stopped) {
            break;
          }
          listener(event);
        }
      }
    }
  }
}

