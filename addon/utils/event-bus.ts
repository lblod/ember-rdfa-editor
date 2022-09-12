import {
  CustomEditorEvent,
  EDITOR_EVENT_MAP,
  EventWithName,
} from '@lblod/ember-rdfa-editor/utils/editor-event';
import { debounced } from '@lblod/ember-rdfa-editor/utils/debounce';

export type EditorEventName = keyof EDITOR_EVENT_MAP;

export type AnyEventName = EditorEventName | string;
export type EditorEventListener<E extends AnyEventName> = (
  event: EventWithName<E>
) => void;
export const eventListenerPriorities: EventListenerPriority[] = [
  'highest',
  'high',
  'default',
  'low',
  'lowest',
  'internal',
];
export type EventListenerPriority =
  | 'highest'
  | 'high'
  | 'default'
  | 'low'
  | 'lowest'
  | 'internal';

export interface ListenerConfig {
  priority?: EventListenerPriority;
  context?: string;
}

export default class EventBus {
  private listeners: Map<AnyEventName, PriorityListenerQueue<AnyEventName>> =
    new Map<EditorEventName, PriorityListenerQueue<EditorEventName>>();
  private debouncedEmitters: Map<
    AnyEventName,
    EditorEventListener<AnyEventName>
  >;

  constructor() {
    this.debouncedEmitters = new Map([
      [
        'selectionChanged',
        debounced(this.doEmit, 300, { leading: true, trailing: true }),
      ],
    ]);
  }

  on<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    { priority = 'default' }: ListenerConfig = {}
  ): void {
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
    { priority = 'default' }: ListenerConfig = {}
  ): void {
    const listenerQueue = this.listeners.get(eventName);
    if (listenerQueue) {
      listenerQueue.removeListener(callback, priority);
    }
  }

  private doEmit = <E extends AnyEventName>(event: EventWithName<E>): void => {
    const listenerQueue = this.listeners.get(event.name);

    console.debug(
      `${event.owner} is emitting event: ${event.name} with payload:`,
      event.payload
    );
    if (listenerQueue) {
      listenerQueue.propagate(event);
    }
  };
  emit = <E extends AnyEventName>(event: EventWithName<E>): void => {
    const emitter = this.debouncedEmitters.get(event.name);
    if (emitter) {
      emitter(event);
    } else {
      this.doEmit(event);
    }
  };
  emitCustom = <P>(event: CustomEditorEvent<P>) => {
    this.emit<string>(event);
  };
}

class PriorityListenerQueue<E extends AnyEventName> {
  private listeners: Map<EventListenerPriority, EditorEventListener<E>[]> =
    new Map<EventListenerPriority, EditorEventListener<E>[]>();
  private callStack: EditorEventListener<E>[] = [];

  addListener(
    listener: EditorEventListener<E>,
    priority: EventListenerPriority
  ) {
    const queue = this.listeners.get(priority);
    if (!queue) {
      this.listeners.set(priority, [listener]);
    } else {
      queue.splice(0, 0, listener);
    }
  }

  removeListener(
    listener: EditorEventListener<E>,
    priority: EventListenerPriority
  ) {
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
          if (!this.callStack.includes(listener)) {
            this.callStack.push(listener);

            listener(event);
            this.callStack.pop();
          }
        }
      }
    }
  }
}
