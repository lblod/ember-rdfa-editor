import {debouncedAdjustable} from "@lblod/ember-rdfa-editor/archive/utils/debounce";
import {
  CustomEditorEvent,
  EditorEventContext,
  EditorEventName,
  EventWithName
} from "@lblod/ember-rdfa-editor/core/editor-events";

export type AnyEventName = EditorEventName | string;
export type EditorEventListener<E extends AnyEventName> = (event: EventWithName<E>) => void;

export type DebouncedEmitter<E extends AnyEventName> = (delayMs: number, event: EventWithName<E>) => void;

export const eventListenerPriorities: EventListenerPriority[] = ["highest", "high", "default", "low", "lowest", "internal"];

export type EventListenerPriority = "highest" | "high" | "default" | "low" | "lowest" | "internal";

export interface ListenerConfig {
  priority?: EventListenerPriority,
  context?: string
}

export const ROOT_CONTEXT = "root";

/**
 * The event bus is a simple event system for internal and external use.
 * It's purpose is to decouple editor events from the browser for more control and easier testability.
 */
export default class EventBus {

  private listeners: Map<AnyEventName, PriorityListenerQueue<AnyEventName>> = new Map<EditorEventName, PriorityListenerQueue<EditorEventName>>();
  private debouncedEmitters: Map<AnyEventName, DebouncedEmitter<AnyEventName>> = new Map();

  on<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    {
      priority = "default",
      context = ROOT_CONTEXT
    }: ListenerConfig = {}): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.addListener(callback, priority, context);

    } else {
      const newQueue = new PriorityListenerQueue<AnyEventName>();
      newQueue.addListener(callback, priority, context);
      this.listeners.set(eventName, newQueue);
    }
  }

  off<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    {
      priority = "default",
      context = ROOT_CONTEXT
    }: ListenerConfig = {}): void {
    const listenerQueue = this.listeners.get(eventName);
    if (listenerQueue) {
      listenerQueue.removeListener(callback, priority, context);
    }
  }

  emit = <E extends AnyEventName>(event: EventWithName<E>): void => {
    const listenerQueue = this.listeners.get(event.name);

    console.log(`${event.owner} is emitting event: ${event.name} with payload:`, event.payload);
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
  private queues: Map<EventListenerPriority, ListenerQueue<E>> = new Map<EventListenerPriority, ListenerQueue<E>>();


  addListener(listener: EditorEventListener<E>, priority: EventListenerPriority, context: string) {
    const queue = this.queues.get(priority);
    if (!queue) {
      const newQueue = new ListenerQueue<E>();
      newQueue.addListener(listener, context);
      this.queues.set(priority, newQueue);
    } else {
      queue.addListener(listener, context);
    }
  }

  removeListener(listener: EditorEventListener<E>, priority: EventListenerPriority, context: string) {
    const queue = this.queues.get(priority);
    if (queue) {
      queue.removeListener(listener, context);
    }
  }

  propagate(event: EventWithName<E>) {
    for (const prio of eventListenerPriorities) {
      if (event.stopped) {
        break;
      }
      const queue = this.queues.get(prio);
      if (queue) {
        queue.propagate(event);
      }
    }
  }
}

class ListenerQueue<E extends AnyEventName> {
  private listeners: Map<string, EditorEventListener<E>[]> = new Map<string, EditorEventListener<E>[]>();

  addListener(listener: EditorEventListener<E>, context: string) {
    const serializedContext = context;
    const queue = this.listeners.get(serializedContext);
    if (!queue) {
      this.listeners.set(serializedContext, [listener]);
    } else {
      queue.splice(0, 0, listener);
    }
  }

  removeListener(listener: EditorEventListener<E>, context: string) {
    const queue = this.listeners.get(context);
    if (queue) {
      const index = queue.indexOf(listener);
      queue.splice(index, 1);
    }
  }

  propagate(event: EventWithName<E>) {
    this.bubble(event);
  }

  private bubble(event: EventWithName<E>) {
    let hasSeenRoot = false;
    const {context} = event;

    let cur: EditorEventContext | null = context;

    while (cur && !event.stopped) {
      const serialized = cur.serialize();
      if (serialized === ROOT_CONTEXT) {
        hasSeenRoot = true;
      }
      const listeners = this.listeners.get(serialized);
      if (listeners) {
        this.notifyListeners(event, listeners);
      }
      cur = cur.getParent();
      console.log("Bubbled to", cur?.serialize());
    }
    if (!event.stopped && !hasSeenRoot) {
      const listeners = this.listeners.get(ROOT_CONTEXT);
      if (listeners) {
        this.notifyListeners(event, listeners);
      }
    }
  }

  private notifyListeners(event: EventWithName<E>, listeners: EditorEventListener<E>[]) {
    for (const listener of listeners) {
      if (event.stopped) {
        break;
      }
      listener(event);
    }
  }
}
