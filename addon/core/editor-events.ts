import {CORE_OWNER} from "@lblod/ember-rdfa-editor/util/constants";
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import {RdfaContextFactory} from "@lblod/ember-rdfa-editor/core/rdfa-context";
import Operation from "@lblod/ember-rdfa-editor/core/operations/operation";
import InsertOperation from "@lblod/ember-rdfa-editor/core/operations/insert-operation";
import AttributeOperation from "@lblod/ember-rdfa-editor/core/operations/attribute-operation";
import MoveOperation from "@lblod/ember-rdfa-editor/core/operations/move-operation";
import SplitOperation from "@lblod/ember-rdfa-editor/core/operations/split-operation";
import {AnyEventName} from "@lblod/ember-rdfa-editor/core/event-bus";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/util/errors";
import Datastore from "@lblod/ember-rdfa-editor/util/datastore";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";

export type EDITOR_EVENT_MAP = {
  "dummy": DummyEvent,
  "contentChanged": ContentChangedEvent,
  "modelWritten": ModelWrittenEvent,
  "modelRead": ModelReadEvent,
  "selectionChanged": SelectionChangedEvent,
  "keyDown": KeydownEvent,
  "afterInsertOperation": AfterInsertOperationEvent,
  "afterMoveOperation": AfterMoveOperationEvent,
  "afterAttributeOperation": AfterAttributeOperationEvent,
  "afterSplitOperation": AfterSplitOperationEvent,
  "paste": PasteEvent,
  "cut": CutEvent,
  "copy": CopyEvent
};

export type EventWithName<N extends EditorEventName | string> = N extends EditorEventName ? EDITOR_EVENT_MAP[N] : CustomEditorEvent<unknown>;
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

  get name(): AnyEventName;

  get owner(): string;

  set owner(value: string);

  get stopped(): boolean;

  get context(): EditorEventContext;
}

export abstract class AbstractEditorEvent<P> implements EditorEvent<P> {
  abstract _name: AnyEventName;
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

  get name(): AnyEventName {
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
  _name: EditorEventName = "afterInsertOperation";

  constructor(payload: InsertOperation) {
    super(payload);
  }
}

export class AfterAttributeOperationEvent extends OperationEvent<AttributeOperation> {
  _name: EditorEventName = "afterAttributeOperation";

  constructor(payload: AttributeOperation) {
    super(payload);
  }
}

export class AfterMoveOperationEvent extends OperationEvent<MoveOperation> {
  _name: EditorEventName = "afterMoveOperation";

  constructor(payload: MoveOperation) {
    super(payload);
  }
}

export class AfterSplitOperationEvent extends OperationEvent<SplitOperation> {
  _name: EditorEventName = "afterSplitOperation";

  constructor(payload: SplitOperation) {
    super(payload);
  }
}

export abstract class VoidEvent extends AbstractEditorEvent<void> {
  constructor(owner = CORE_OWNER) {
    super({owner, payload: undefined});
  }
}

export class ModelReadEvent extends VoidEvent {
  _name: EditorEventName = "modelRead";

  constructor() {
    super();
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

export class ContentChangedEventPayload {
  private _damagedSubTree: ModelElement;

  constructor(damagedSubTree: ModelElement) {
    this._damagedSubTree = damagedSubTree;
  }

  get damagedSubTree(): ModelElement {
    return this._damagedSubTree;
  }

  get damagedRange(): ModelRange {
    return ModelRange.fromAroundNode(this.damagedSubTree);
  }

}

export class ContentChangedEvent extends AbstractEditorEvent<ContentChangedEventPayload> {
  _name: EditorEventName = "contentChanged";

  constructor(damagedSubTree: ModelElement, owner = CORE_OWNER) {
    super({payload: new ContentChangedEventPayload(damagedSubTree), owner});
  }
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

class SelectionChangedEventPayload {
  _selection: ModelSelection;
  _parentDataset?: Datastore;

  constructor(selection: ModelSelection) {
    this._selection = selection;
  }

  get selection(): ModelSelection {
    return this._selection;
  }

  get parentDataset(): Datastore {
    if (!this._parentDataset) {
      if (!ModelSelection.isWellBehaved(this._selection)) {
        throw new MisbehavedSelectionError();
      }
      this._parentDataset = this._selection.getParentContext();
      return this._parentDataset;
    } else {
      return this._parentDataset;
    }
  }
}

export class SelectionChangedEvent extends AbstractEditorEvent<SelectionChangedEventPayload> {
  _name: EditorEventName = "selectionChanged";

  constructor(selection: ModelSelection, owner: string = CORE_OWNER) {
    super({
      payload: new SelectionChangedEventPayload(selection), owner
    });
  }
}

export interface PasteEventPayload {
  data: DataTransfer | null,
  domEvent: ClipboardEvent,
  pasteHTML?: boolean,
  pasteExtendedHTML?: boolean
}

export class PasteEvent extends AbstractEditorEvent<PasteEventPayload> {
  _name: EditorEventName = "paste";

  constructor({
                owner,
                context,
                payload: {
                  data,
                  domEvent,
                  pasteExtendedHTML = false,
                  pasteHTML = false
                }
              }: EventConfig<PasteEventPayload>) {
    super({owner, payload: {data, domEvent, pasteHTML, pasteExtendedHTML}, context});
  }
}

export interface CutEventPayload {
  domEvent: ClipboardEvent
}

export class CutEvent extends AbstractEditorEvent<CutEventPayload> {
  _name: EditorEventName = "cut";

  constructor(config: EventConfig<CutEventPayload>) {
    super(config);
  }
}

export interface CopyEventPayload {
  domEvent: ClipboardEvent
}

export class CopyEvent extends AbstractEditorEvent<CopyEventPayload> {
  _name: EditorEventName = "copy";

  constructor(config: EventConfig<CopyEventPayload>) {
    super(config);
  }
}

export abstract class CustomEditorEvent<P> extends AbstractEditorEvent<P> {
  abstract _name: string;
}
