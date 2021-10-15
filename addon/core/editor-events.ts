import {CORE_OWNER} from "@lblod/ember-rdfa-editor/util/constants";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import {RdfaContext, RdfaContextFactory} from "@lblod/ember-rdfa-editor/core/rdfa-context";
import Operation from "@lblod/ember-rdfa-editor/core/operations/operation";
import InsertOperation from "@lblod/ember-rdfa-editor/core/operations/insert-operation";
import AttributeOperation from "@lblod/ember-rdfa-editor/core/operations/attribute-operation";
import MoveOperation from "@lblod/ember-rdfa-editor/core/operations/move-operation";
import SplitOperation from "@lblod/ember-rdfa-editor/core/operations/split-operation";

export type EDITOR_EVENT_MAP = {
  "dummy": DummyEvent,
  "contentChanged": ContentChangedEvent,
  "modelWritten": ModelWrittenEvent,
  "selectionChanged": SelectionChangedEvent,
  "keyDown": KeydownEvent,
  "after-insert-operation": AfterInsertOperationEvent,
  "after-move-operation": AfterMoveOperationEvent,
  "after-attribute-operation": AfterAttributeOperationEvent,
  "after-split-operation": AfterSplitOperationEvent
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

interface ContextOwnerConfig {
  owner?: string;
  context?: EditorEventContext;
}

export type EventConfig<P> = ContextOwnerConfig & {
  payload: P;
};

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

export abstract class OperationEvent<O extends Operation> extends AbstractEditorEvent<O> {

  protected constructor(payload: O) {
    super({owner: CORE_OWNER, payload});
  }
}

export class AfterInsertOperationEvent extends OperationEvent<InsertOperation> {
  _name: EditorEventName = "after-insert-operation";

  constructor(payload: InsertOperation) {
    super(payload);
  }
}

export class AfterAttributeOperationEvent extends OperationEvent<AttributeOperation> {
  _name: EditorEventName = "after-attribute-operation";

  constructor(payload: AttributeOperation) {
    super(payload);
  }
}

export class AfterMoveOperationEvent extends OperationEvent<MoveOperation> {
  _name: EditorEventName = "after-move-operation";

  constructor(payload: MoveOperation) {
    super(payload);
  }
}

export class AfterSplitOperationEvent extends OperationEvent<SplitOperation> {
  _name: EditorEventName = "after-split-operation";

  constructor(payload: SplitOperation) {
    super(payload);
  }
}

export abstract class VoidEvent extends AbstractEditorEvent<void> {
  constructor(owner = CORE_OWNER) {
    super({owner, payload: undefined});
  }
}

export class DummyEvent extends AbstractEditorEvent<void> {
  _name: EditorEventName = "dummy";

  constructor({
                context = new DefaultEventContext(),
                owner = "test"
              }: ContextOwnerConfig = {}) {
    super({payload: undefined, context, owner});
  }
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
  rdfaContext: RdfaContext;
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

