import {CORE_OWNER} from "@lblod/ember-rdfa-editor/util/constants";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import {RdfaContextFactory} from "@lblod/ember-rdfa-editor/core/rdfa-context";

export type EDITOR_EVENT_MAP = {
  "dummy": DummyEvent,
  "contentChanged": ContentChangedEvent,
  "modelWritten": ModelWrittenEvent,
  "selectionChanged": SelectionChangedEvent
  "keyDown": KeydownEvent
};
export type EditorEventName = keyof EDITOR_EVENT_MAP;

export interface EditorEventContext {
  getParent(): EditorEventContext | null;

  serialize(): string;
}

export class DefaultEventContext implements EditorEventContext {
  getParent(): EditorEventContext | null {
    return null;
  }

  serialize(): string {
    return "root";
  }
}


export class RdfaEventContext implements EditorEventContext {
  private element: ModelElement;

  constructor(element: ModelElement) {
    this.element = element;
  }

  getParent(): EditorEventContext | null {
    const parent = this.element.parent;
    if (parent) {
      return new RdfaEventContext(parent);
    }
    return null;
  }

  serialize(): string {
    return RdfaContextFactory.serialize(RdfaContextFactory.fromElement(this.element));
  }

}

export interface EventConfig<P> {
  owner?: string;
  context?: EditorEventContext;
  payload: P;
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
  private _context: EditorEventContext;
  private _payload: P;
  private _owner: string;

  protected constructor({context = new DefaultEventContext(), owner = CORE_OWNER, payload}: EventConfig<P>) {
    this._context = context;
    this._payload = payload;
    this._owner = owner;
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
    super({owner, payload: undefined});
  }
}

export class DummyEvent extends VoidEvent {
  _name: EditorEventName = "dummy";
}

export class ContentChangedEvent extends VoidEvent {
  _name: EditorEventName = "contentChanged";
}


export class ModelWrittenEvent extends VoidEvent {
  _name: EditorEventName = "modelWritten";
}

export class KeydownEvent extends AbstractEditorEvent<KeyboardEvent> {
  _name: EditorEventName = "keyDown";

  constructor(payload: KeyboardEvent, owner: string = CORE_OWNER) {
    super({payload, owner});
  }
}

interface SelectionChangedEventPayload {
  selection: ModelSelection;
}

export class SelectionChangedEvent extends AbstractEditorEvent<SelectionChangedEventPayload> {
  _name: EditorEventName = "selectionChanged";

  constructor({
                payload,
                owner = CORE_OWNER,
                context
              }: { payload: SelectionChangedEventPayload, owner?: string, context: EditorEventContext }) {
    super({payload, owner, context});
  }
}

