import {CORE_OWNER} from "@lblod/ember-rdfa-editor/util/constants";

export type EDITOR_EVENT_MAP = {
  "dummy": DummyEvent,
  "contentChanged": ContentChangedEvent,
  "modelWritten": ModelWrittenEvent,
  "selectionChanged": SelectionChangedEvent
  "keyDown": KeydownEvent
};
export type EditorEventName = keyof EDITOR_EVENT_MAP;

export interface EditorEventContext {
  parent?: EditorEventContext;

  serialize(): string;
}

export class DefaultEventContext implements EditorEventContext {
  serialize(): string {
    return "root";
  }
}

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

  protected constructor(private _payload: P,
                        private _owner = CORE_OWNER,
                        private _context: EditorEventContext = new DefaultEventContext()) {
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

