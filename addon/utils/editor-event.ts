import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import { AnyEventName } from '@lblod/ember-rdfa-editor/utils/event-bus';
import { CORE_OWNER } from '@lblod/ember-rdfa-editor/utils/constants';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import ModelPosition from '@lblod/ember-rdfa-editor/core/model/model-position';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';

export type EDITOR_EVENT_MAP = {
  dummy: DummyEvent;
  contentChanged: ContentChangedEvent;
  modelWritten: ModelWrittenEvent;
  modelRead: ModelReadEvent;
  selectionChanged: SelectionChangedEvent;
  paste: PasteEvent;
  cut: CutEvent;
  copy: CopyEvent;
  insertText: InsertTextEvent;
  insertParagraph: InsertParagraphEvent;
  insertLineBreak: InsertLineBreakEvent;
  deleteContentBackward: DeleteContentBackwardEvent;
  deleteContentForward: DeleteContentForwardEvent;
  configUpdated: ConfigUpdatedEvent;
};

export type EventWithName<N extends EditorEventName | string> =
  N extends EditorEventName ? EDITOR_EVENT_MAP[N] : CustomEditorEvent<unknown>;
export type EditorEventName = keyof EDITOR_EVENT_MAP;

export interface EventConfig<P> {
  owner: string;
  payload: P;
}

export interface EditorEvent<P> {
  get payload(): P;

  get name(): AnyEventName;

  get owner(): string;

  set owner(value: string);

  get stopped(): boolean;

  stopPropagation(): void;
}

export abstract class AbstractEditorEvent<P> implements EditorEvent<P> {
  abstract _name: AnyEventName;
  private _stopped = false;
  private readonly _payload: P;
  private _owner: string;

  constructor({ owner = CORE_OWNER, payload }: EventConfig<P>) {
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

  stopPropagation() {
    this._stopped = true;
  }
}

export abstract class VoidEvent extends AbstractEditorEvent<void> {
  constructor(owner = CORE_OWNER) {
    super({ owner, payload: undefined });
  }
}

export class ModelReadEvent extends VoidEvent {
  _name: EditorEventName = 'modelRead';
}

export class DummyEvent extends AbstractEditorEvent<void> {
  _name: EditorEventName = 'dummy';

  constructor({ owner = 'test' } = {}) {
    super({ payload: undefined, owner });
  }
}

interface UnknownPayload {
  type: 'unknown';
  rootModelNode: ModelElement;
}

interface MovePayload {
  type: 'move';
  startRange: ModelRange;
  resultRange: ModelRange;
  targetPosition: ModelPosition;
  insertedNodes: ModelNode[];
  /**
   * Temporary workaround until immutability allows for a cleaner
   * view on which nodes have changed and which have not.
   *
   * At the moment it is impossible to provide a definition of
   * "changed/affected node" that is useful in a general way.
   * (Has a node changed if its children have changed? what about its parent?
   * If you keep saying yes, eventually all nodes will be included all the time)
   */
  _markCheckNodes: ModelNode[];
}

interface InsertionPayload {
  type: 'insert';
  oldRange: ModelRange;
  newRange: ModelRange;
  overwrittenNodes: ModelNode[];
  insertedNodes: ModelNode[];
  /**
   * Temporary workaround until immutability allows for a cleaner
   * view on which nodes have changed and which have not.
   */
  _markCheckNodes: ModelNode[];
}

interface RemovePayload {
  type: 'remove';
  oldRange: ModelRange;
  newRange: ModelRange;
  overwrittenNodes: ModelNode[];
  insertedNodes: ModelNode[];
  _markCheckNodes: ModelNode[];
}

type ContentChangedPayload =
  | InsertionPayload
  | MovePayload
  | RemovePayload
  | UnknownPayload;

export class ContentChangedEvent extends AbstractEditorEvent<ContentChangedPayload> {
  _name: EditorEventName = 'contentChanged';
}

export class ModelWrittenEvent extends VoidEvent {
  _name: EditorEventName = 'modelWritten';
}

export class InsertTextEvent extends AbstractEditorEvent<InputEvent> {
  _name: EditorEventName = 'insertText';
}

export class InsertParagraphEvent extends AbstractEditorEvent<InputEvent> {
  _name: EditorEventName = 'insertParagraph';
}

export class DeleteContentBackwardEvent extends AbstractEditorEvent<InputEvent> {
  _name: EditorEventName = 'deleteContentBackward';
}

export class DeleteContentForwardEvent extends AbstractEditorEvent<InputEvent> {
  _name: EditorEventName = 'deleteContentForward';
}

export class InsertLineBreakEvent extends AbstractEditorEvent<InputEvent> {
  _name: EditorEventName = 'insertLineBreak';
}

export class SelectionChangedEvent extends AbstractEditorEvent<ModelSelection> {
  _name: EditorEventName = 'selectionChanged';
}
export interface ConfigUpdatedEventPayload {
  changedKey: string;
  oldValue: string | null;
  newValue: string | null;
}
export class ConfigUpdatedEvent extends AbstractEditorEvent<ConfigUpdatedEventPayload> {
  _name: EditorEventName = 'configUpdated';
}

export interface PasteEventPayload {
  data: DataTransfer | null;
  domEvent: ClipboardEvent;
  pasteHTML?: boolean;
  pasteExtendedHTML?: boolean;
}

export class PasteEvent extends AbstractEditorEvent<PasteEventPayload> {
  _name: EditorEventName = 'paste';

  constructor({
    owner,
    payload: { data, domEvent, pasteExtendedHTML = false, pasteHTML = false },
  }: EventConfig<PasteEventPayload>) {
    super({ owner, payload: { data, domEvent, pasteHTML, pasteExtendedHTML } });
  }
}

export interface CutEventPayload {
  domEvent: ClipboardEvent;
}

export class CutEvent extends AbstractEditorEvent<CutEventPayload> {
  _name: EditorEventName = 'cut';
}

export interface CopyEventPayload {
  domEvent: ClipboardEvent;
}

export class CopyEvent extends AbstractEditorEvent<CopyEventPayload> {
  _name: EditorEventName = 'copy';
}

export abstract class CustomEditorEvent<P> extends AbstractEditorEvent<P> {
  abstract _name: string;
}
