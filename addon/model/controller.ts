import Command from '@lblod/ember-rdfa-editor/commands/command';
import {
  AnyEventName,
  EditorEventListener,
  ListenerConfig,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import {
  ModelRangeFactory,
  RangeFactory,
} from '@lblod/ember-rdfa-editor/model/model-range';
import Datastore from '@lblod/ember-rdfa-editor/model/util/datastore/datastore';
import GenTreeWalker, {
  TreeWalkerFactory,
} from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import { Mark, MarkSpec } from '@lblod/ember-rdfa-editor/model/mark';
import ModelElement, {
  ElementType,
} from '@lblod/ember-rdfa-editor/model/model-element';
import LiveMarkSet, {
  LiveMarkSetArgs,
} from '@lblod/ember-rdfa-editor/model/live-mark-set';
import MarksRegistry from '@lblod/ember-rdfa-editor/model/marks-registry';
import ImmediateModelMutator from '@lblod/ember-rdfa-editor/model/mutators/immediate-model-mutator';
import { InlineComponentSpec } from './inline-components/model-inline-component';
import NodeView from './node-view';
import { ConfigUpdatedEvent } from '../utils/editor-event';
import ModelNode from './model-node';

export type WidgetLocation = 'toolbar' | 'sidebar' | 'insertSidebar';

export interface WidgetSpec {
  componentName: string;
  desiredLocation: WidgetLocation;
  /**
   * @deprecated use widgetArgs instead
   * */
  plugin?: EditorPlugin;
  widgetArgs?: unknown;
}

export type InternalWidgetSpec = WidgetSpec & {
  controller: Controller;
};

interface EditorUtils {
  toFilterSkipFalse: typeof toFilterSkipFalse;
}

export default interface Controller {
  get name(): string;

  get selection(): ModelSelection;

  get rangeFactory(): RangeFactory;

  get treeWalkerFactory(): TreeWalkerFactory;

  get datastore(): Datastore;

  get util(): EditorUtils;

  get ownMarks(): Set<Mark>;

  get modelRoot(): ModelElement;

  get marksRegistry(): MarksRegistry;

  getMutator(): ImmediateModelMutator;

  getMarksFor(owner: string): Set<Mark>;

  createLiveMarkSet(args: LiveMarkSetArgs): LiveMarkSet;

  createModelElement(type: ElementType): ModelElement;

  executeCommand<A extends unknown[], R>(
    commandName: string,
    ...args: A
  ): R | void;

  canExecuteCommand<A extends unknown[]>(
    commandName: string,
    ...args: A
  ): boolean;

  registerCommand<A extends unknown[], R>(command: Command<A, R>): void;

  registerWidget(spec: WidgetSpec): void;

  registerMark(spec: MarkSpec): void;

  registerInlineComponent(component: InlineComponentSpec): void;

  onEvent<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ): void;

  offEvent<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ): void;

  getConfig(key: string): string | null;

  setConfig(key: string, value: string | null): void;

  write(writeSelection?: boolean, moveSelectionIntoView?: boolean): void;
}

export class RawEditorController implements Controller {
  private readonly _name: string;
  protected readonly _rawEditor: RawEditor;
  private _rangeFactory: RangeFactory;

  constructor(name: string, rawEditor: RawEditor) {
    this._name = name;
    this._rawEditor = rawEditor;
    this._rangeFactory = new ModelRangeFactory(this._rawEditor.rootModelNode);
  }

  get name(): string {
    return this._name;
  }

  get selection(): ModelSelection {
    return this._rawEditor.selection;
  }

  get rangeFactory(): RangeFactory {
    return this._rangeFactory;
  }

  get datastore(): Datastore {
    return this._rawEditor.datastore;
  }

  get util(): EditorUtils {
    return { toFilterSkipFalse };
  }

  get treeWalkerFactory(): TreeWalkerFactory {
    return GenTreeWalker;
  }

  get ownMarks(): Set<Mark> {
    return this.getMarksFor(this.name);
  }

  get modelRoot(): ModelElement {
    return this._rawEditor.rootModelNode;
  }
  get domRoot(): Element {
    return this._rawEditor.rootNode;
  }

  get marksRegistry(): MarksRegistry {
    return this._rawEditor.model.marksRegistry;
  }

  getMutator(): ImmediateModelMutator {
    return new ImmediateModelMutator(this._rawEditor.eventBus);
  }

  getMarksFor(owner: string): Set<Mark> {
    return this._rawEditor.model.marksRegistry.getMarksFor(owner);
  }

  getConfig(key: string): string | null {
    return this._rawEditor.config.get(key) || null;
  }
  setConfig(key: string, value: string | null): void {
    const oldValue = this.getConfig(key);
    this._rawEditor.config.set(key, value);
    this._rawEditor.eventBus.emit(
      new ConfigUpdatedEvent({
        owner: this.name,
        payload: {
          changedKey: key,
          oldValue,
          newValue: value,
        },
      })
    );
  }
  createLiveMarkSet(args: LiveMarkSetArgs): LiveMarkSet {
    return new LiveMarkSet(this, args);
  }

  createModelElement(type: ElementType): ModelElement {
    return new ModelElement(type);
  }

  executeCommand<A extends unknown[], R>(
    commandName: string,
    ...args: A
  ): R | void {
    return this._rawEditor.executeCommand(commandName, ...args) as R | void;
  }

  canExecuteCommand<A extends unknown[]>(
    commandName: string,
    ...args: A
  ): boolean {
    return this._rawEditor.canExecuteCommand(commandName, ...args);
  }
  modelToView(node: ModelNode): NodeView | null {
    return this._rawEditor.model.modelToView(node);
  }

  offEvent<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ): void {
    this._rawEditor.off(eventName, callback, config);
  }

  onEvent<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ): void {
    this._rawEditor.on(eventName, callback, config);
  }

  registerCommand<A extends unknown[], R>(command: Command<A, R>): void {
    this._rawEditor.registerCommand(command);
  }

  registerWidget(_spec: WidgetSpec): void {
    this._rawEditor.registerWidget({ ..._spec, controller: this });
  }

  registerMark(spec: MarkSpec) {
    this._rawEditor.registerMark(spec);
  }

  registerInlineComponent(component: InlineComponentSpec) {
    this._rawEditor.registerComponent(component);
  }

  write(writeSelection = true, moveSelectionIntoView = false) {
    this._rawEditor.model.write(
      this.modelRoot,
      writeSelection,
      moveSelectionIntoView
    );
  }
}
