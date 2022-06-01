import Command, {
  CommandMap,
  CommandName,
} from '@lblod/ember-rdfa-editor/commands/command';
import {
  AnyEventName,
  EditorEventListener,
  ListenerConfig,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
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
import {
  AttributeSpec,
  Mark,
  MarkSpec,
} from '@lblod/ember-rdfa-editor/model/mark';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import LiveMarkSet, {
  LiveMarkSetArgs,
} from '@lblod/ember-rdfa-editor/model/live-mark-set';
import MarksRegistry from '@lblod/ember-rdfa-editor/model/marks-registry';
import ImmediateModelMutator from '@lblod/ember-rdfa-editor/model/mutators/immediate-model-mutator';
import { Editor } from '../core/editor';
import Transaction from '../core/transaction';
import { CommandArgs, CommandReturn } from '../core/state';

export type WidgetLocation = 'toolbar' | 'sidebar' | 'insertSidebar';

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

  get marksRegistry(): MarksRegistry;

  getMarksFor(owner: string): Set<Mark>;

  createLiveMarkSet(args: LiveMarkSetArgs): LiveMarkSet;

  createTransaction(): Transaction;

  dispatchTransaction(tr: Transaction): void;

  executeCommand<N extends CommandName>(
    commandName: N,
    args: CommandArgs<N>
  ): CommandReturn<N>;

  canExecuteCommand<N extends CommandName>(
    commandName: N,
    args: CommandArgs<N>
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

export class EditorController implements Controller {
  private _name: string;
  protected _editor: Editor;
  constructor(name: string, editor: Editor) {
    this._name = name;
    this._editor = editor;
  }
  get name(): string {
    return this._name;
  }
  get selection(): ModelSelection {
    return this._editor.state.selection;
  }
  get rangeFactory(): RangeFactory {
    return new ModelRangeFactory(this._editor.state.document);
  }
  get treeWalkerFactory(): TreeWalkerFactory {
    return GenTreeWalker;
  }
  get datastore(): Datastore {
    return this._editor.state.datastore;
  }
  get util(): EditorUtils {
    throw new Error('Method not implemented.');
  }
  get ownMarks(): Set<Mark<AttributeSpec>> {
    throw new Error('Method not implemented.');
  }
  get modelRoot(): ModelElement {
    return this._editor.state.document;
  }
  get marksRegistry(): MarksRegistry {
    return this._editor.state.marksRegistry;
  }
  createTransaction(): Transaction {
    return this._editor.state.createTransaction();
  }
  dispatchTransaction(tr: Transaction): void {
    this._editor.dispatchTransaction(tr);
  }
  executeCommand<N extends keyof CommandMap>(
    commandName: N,
    args: CommandArgs<N>
  ): ReturnType<CommandMap[N]['execute']> {
    return this._editor.executeCommand(commandName, args);
  }
  canExecuteCommand<N extends keyof CommandMap>(
    commandName: N,
    args: CommandArgs<N>
  ): boolean {
    return this._editor.canExecuteCommand(commandName, args);
  }
  getMutator(): ImmediateModelMutator {
    throw new Error('Method not implemented.');
  }
  getMarksFor(owner: string): Set<Mark<AttributeSpec>> {
    throw new Error('Method not implemented.');
  }
  createLiveMarkSet(args: LiveMarkSetArgs): LiveMarkSet {
    throw new Error('Method not implemented.');
  }
  registerCommand<A extends unknown[], R>(command: Command<A, R>): void {
    throw new Error('Method not implemented.');
  }
  registerWidget(spec: WidgetSpec): void {
    throw new Error('Method not implemented.');
  }
  registerMark(spec: MarkSpec<AttributeSpec>): void {
    throw new Error('Method not implemented.');
  }
  onEvent<E extends string>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ): void {
    this._editor.onEvent(eventName, callback, config);
  }
  offEvent<E extends string>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ): void {
    this._editor.offEvent(eventName, callback, config);
  }
}
