import {debouncedAdjustable} from "@lblod/ember-rdfa-editor/archive/utils/debounce";
import {CORE_OWNER} from "@lblod/ember-rdfa-editor/util/constants";

export interface EditorEvent<P> {

  get payload(): P;

  get name(): EditorEventName;

  get owner(): string;

  set owner(value: string);

  get stopped(): boolean;

  get context(): EditorEventContext;
}

export abstract class AbstractEditorEvent<P> implements EditorEvent<P> {
  abstract _name: EditorEventName;
  private _stopped = false;

  protected constructor(private _payload: P, private _owner = CORE_OWNER, private _context: EditorEventContext = new DefaultEventContext()) {
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

  get stopped(): boolean {
    return this._stopped;
  }

  get context(): EditorEventContext {
    return this._context;
  }

  stopPropagation() {
    this._stopped = true;
  }
}

export abstract class VoidEvent extends AbstractEditorEvent<void> {
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

export class KeydownEvent extends AbstractEditorEvent<KeyboardEvent> {
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


interface EditorEventContext {
  parent?: EditorEventContext;

  serialize(): string;

}

class DefaultEventContext implements EditorEventContext {
  serialize(): string {
    return "root";
  }
}


export const eventListenerPriorities = ["highest", "high", "default", "low", "lowest", "internal"];
export type EventListenerPriority = typeof eventListenerPriorities[number];



export interface ListenerConfig {
  priority?: EventListenerPriority,
  context?: EditorEventContext
}

export default class EventBus {

  private listeners: Map<EditorEventName, PriorityListenerQueue<EditorEventName>> = new Map<EditorEventName, PriorityListenerQueue<EditorEventName>>();
  private debouncedEmitters: Map<EditorEventName, DebouncedEmitter<EditorEventName>> = new Map();

  on<E extends EditorEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    {
      priority = "default",
      context = new DefaultEventContext()
    }: ListenerConfig = {}): void {
    const eventListeners = this.listeners.get(eventName);
    if (eventListeners) {
      eventListeners.addListener(callback, priority, context);

    } else {
      const newQueue = new PriorityListenerQueue<EditorEventName>();
      newQueue.addListener(callback, priority, context);
      this.listeners.set(eventName, newQueue);
    }
  }

  off<E extends EditorEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    {
      priority = "default",
      context = new DefaultEventContext()
    }: ListenerConfig = {}): void {
    const listenerQueue = this.listeners.get(eventName);
    if (listenerQueue) {
      listenerQueue.removeListener(callback, priority, context);
    }
  }

  emit = <E extends EditorEventName>(event: EDITOR_EVENT_MAP[E]): void => {
    const listenerQueue = this.listeners.get(event.name);

    console.log(`${event.owner} is emitting event: ${event.name} with payload:`, event.payload);
    if (listenerQueue) {
      listenerQueue.propagate(event);
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

class PriorityListenerQueue<E extends EditorEventName> {
  private queues: Map<EventListenerPriority, ListenerQueue<E>> = new Map<EventListenerPriority, ListenerQueue<E>>();


  addListener(listener: EditorEventListener<E>, priority: EventListenerPriority, context: EditorEventContext) {
    const queue = this.queues.get(priority);
    if (!queue) {
      const newQueue = new ListenerQueue<E>();
      newQueue.addListener(listener, context);
      this.queues.set(priority, newQueue);
    } else {
      queue.addListener(listener, context);
    }
  }

  removeListener(listener: EditorEventListener<E>, priority: EventListenerPriority, context: EditorEventContext) {
    const queue = this.queues.get(priority);
    if(queue) {
      queue.removeListener(listener, context);
    }
  }

  propagate(event: EDITOR_EVENT_MAP[E]) {
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

class ListenerQueue<E extends EditorEventName> {
  private listeners: Map<string, EditorEventListener<E>[]> = new Map<string, EditorEventListener<E>[]>();

  addListener(listener: EditorEventListener<E>, context: EditorEventContext) {
    const serializedContext = context.serialize();
    const queue = this.listeners.get(serializedContext);
    if (!queue) {
      this.listeners.set(serializedContext, [listener]);
    } else {
      queue.push(listener);
    }

  }
  removeListener(listener: EditorEventListener<E>, context: EditorEventContext) {
    const queue = this.listeners.get(context.serialize());
    if (queue) {
      const index = queue.indexOf(listener);
      queue.splice(index, 1);
    }
  }

  propagate(event: EDITOR_EVENT_MAP[E]) {
    this.bubble(event);
  }

  private bubble(event: EDITOR_EVENT_MAP[E]) {
    const {context} = event;

    let cur = context;

    while (cur && !event.stopped) {
      const listeners = this.listeners.get(cur.serialize());
      if (listeners) {
        this.notifyListeners(event, listeners);
      }
      if (cur.parent) {
        cur = cur.parent;
      }
    }
  }

  private notifyListeners(event: EDITOR_EVENT_MAP[E], listeners: EditorEventListener<E>[]) {
    for (const listener of listeners) {
      if (event.stopped) {
        break;
      }
      listener(event);
    }
  }
}
