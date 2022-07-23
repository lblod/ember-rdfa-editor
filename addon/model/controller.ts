import { CommandName } from '@lblod/ember-rdfa-editor';
import { Commands } from '@lblod/ember-rdfa-editor';
import Command from '@lblod/ember-rdfa-editor/commands/command';
import LiveMarkSet, {
  LiveMarkSetArgs,
} from '@lblod/ember-rdfa-editor/model/live-mark-set';
import { Mark, MarkSpec } from '@lblod/ember-rdfa-editor/model/mark';
import MarksRegistry from '@lblod/ember-rdfa-editor/model/marks-registry';
import ModelElement, {
  ElementType,
} from '@lblod/ember-rdfa-editor/model/model-element';
import {
  ModelRangeFactory,
  RangeFactory,
} from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ImmediateModelMutator from '@lblod/ember-rdfa-editor/model/mutators/immediate-model-mutator';
import Datastore from '@lblod/ember-rdfa-editor/model/util/datastore/datastore';
import GenTreeWalker, {
  TreeWalkerFactory,
} from '@lblod/ember-rdfa-editor/model/util/gen-tree-walker';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/model/util/model-tree-walker';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import {
  AnyEventName,
  EditorEventListener,
  ListenerConfig,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import { Editor } from '../core/editor';
import Transaction, { TransactionListener } from '../core/transaction';
import { InlineComponentSpec } from './inline-components/model-inline-component';
import ModelNode from './model-node';
import MapUtils from './util/map-utils';
import { AttributeSpec } from './util/render-spec';

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

  getMarksFor(owner: string): Set<Mark>;

  createLiveMarkSet(args: LiveMarkSetArgs): LiveMarkSet;

  createModelElement(type: ElementType): ModelElement;

  createTransaction(): Transaction;

  perform<R>(action: (transaction: Transaction) => R): R;

  dispatchTransaction(tr: Transaction): void;

  registerCommand<N extends CommandName>(name: N, command: Commands[N]): void;

  registerWidget(spec: WidgetSpec): void;

  registerMark(spec: MarkSpec): void;

  registerInlineComponent(component: InlineComponentSpec): void;

  modelToView(node: ModelNode): Node | null;

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

  addTransactionListener(callback: TransactionListener): void;

  removeTransactionListener(callback: TransactionListener): void;
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
    return this.getMarksFor(this.name);
  }
  get modelRoot(): ModelElement {
    return this._editor.state.document;
  }
  get domRoot(): Element {
    return this._editor.view.domRoot;
  }

  get marksRegistry(): MarksRegistry {
    return this._editor.state.marksRegistry;
  }
  createTransaction(): Transaction {
    return this._editor.state.createTransaction();
  }
  perform<R>(action: (transaction: Transaction) => R): R {
    const tr = this.createTransaction();
    const result = action(tr);
    this.dispatchTransaction(tr);
    return result;
  }
  dispatchTransaction(tr: Transaction): void {
    this._editor.dispatchTransaction(tr);
  }
  createLiveMarkSet(args: LiveMarkSetArgs): LiveMarkSet {
    return new LiveMarkSet(this, args);
  }

  createModelElement(type: ElementType): ModelElement {
    return new ModelElement(type);
  }
  registerInlineComponent(component: InlineComponentSpec) {
    this._editor.state.inlineComponentsRegistry.registerComponent(component);
    // this._rawEditor.registerComponent(component);
  }
  getMutator(): ImmediateModelMutator {
    throw new Error('Method not implemented.');
  }
  getMarksFor(owner: string): Set<Mark<AttributeSpec>> {
    return this.marksRegistry.getMarksFor(owner);
  }
  registerCommand<N extends CommandName>(name: N, command: Commands[N]): void {
    this._editor.registerCommand(name, command);
  }
  registerWidget(spec: WidgetSpec): void {
    MapUtils.setOrPush(this._editor.state.widgetMap, spec.desiredLocation, {
      controller: this,
      ...spec,
    });
  }
  registerMark(spec: MarkSpec<AttributeSpec>): void {
    this.marksRegistry.registerMark(spec);
  }
  getConfig(key: string): string | null {
    return this._editor.state.config.get(key) || null;
  }
  setConfig(key: string, value: string | null): void {
    const tr = this._editor.state.createTransaction();
    tr.setConfig(key, value);
  }
  modelToView(node: ModelNode): Node | null {
    return this._editor.view.modelToView(this._editor.state, node);
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

  addTransactionListener(callback: TransactionListener): void {
    this._editor.addTransactionListener(callback);
  }

  removeTransactionListener(callback: TransactionListener): void {
    this._editor.removeTransactionListener(callback);
  }
}
