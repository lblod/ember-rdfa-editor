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
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';

export type WidgetLocation = 'toolbar' | 'sidebar';

export interface WidgetSpec {
  componentName: string;
  desiredLocation: WidgetLocation;
  plugin: EditorPlugin;
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

  getMarksFor(owner: string): Set<Mark>;

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

  getMarksFor(owner: string): Set<Mark> {
    return this._rawEditor.model.marksRegistry.getMarksFor(owner);
  }

  executeCommand<A extends unknown[], R>(
    commandName: string,
    ...args: A
  ): R | void {
    return this._rawEditor.executeCommand(commandName, ...args);
  }

  canExecuteCommand<A extends unknown[]>(
    commandName: string,
    ...args: A
  ): boolean {
    return this._rawEditor.canExecuteCommand(commandName, ...args);
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
}
