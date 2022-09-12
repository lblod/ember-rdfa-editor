import LiveMarkSet, {
  LiveMarkSetArgs,
} from '@lblod/ember-rdfa-editor/model/marks/live-mark-set';
import { Mark, MarkSpec } from '@lblod/ember-rdfa-editor/model/marks/mark';
import MarksRegistry from '@lblod/ember-rdfa-editor/model/marks/marks-registry';
import ModelElement, {
  ElementType,
} from '@lblod/ember-rdfa-editor/model/nodes/model-element';
import {
  ModelRangeFactory,
  RangeFactory,
} from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import Datastore from '@lblod/ember-rdfa-editor/utils/datastore/datastore';
import GenTreeWalker, {
  TreeWalkerFactory,
} from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/utils/model-tree-walker';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/model/editor-plugin';
import {
  AnyEventName,
  EditorEventListener,
  ListenerConfig,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import State from '../state';
import Transaction, {
  TransactionDispatchListener,
  TransactionStepListener,
} from '../state/transaction';
import { View } from '../view';
import { InlineComponentSpec } from '../../model/inline-components/model-inline-component';
import ModelNode from '../../model/nodes/model-node';
import MapUtils from '../../utils/map-utils';
import { AttributeSpec } from '../../utils/render-spec';

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

  get view(): View;

  get currentState(): State;

  getMarksFor(owner: string): Set<Mark>;

  createLiveMarkSet(args: LiveMarkSetArgs): LiveMarkSet;

  createModelElement(type: ElementType): ModelElement;

  createTransaction(): Transaction;

  perform<R>(action: (transaction: Transaction) => R): R;

  dryRun<R>(action: (transaction: Transaction) => R): R;

  dispatchTransaction(tr: Transaction, updateView?: boolean): void;

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

  addTransactionStepListener(callback: TransactionStepListener): void;

  removeTransactionStepListener(callback: TransactionStepListener): void;

  addTransactionDispatchListener(callback: TransactionDispatchListener): void;

  removeTransactionDispatchListener(
    callback: TransactionDispatchListener
  ): void;
}

export class ViewController implements Controller {
  private _name: string;
  protected _view: View;

  constructor(name: string, view: View) {
    this._name = name;
    this._view = view;
  }

  get currentState(): State {
    return this._view.currentState;
  }

  get name(): string {
    return this._name;
  }

  get selection(): ModelSelection {
    return this.currentState.selection;
  }

  get rangeFactory(): RangeFactory {
    return new ModelRangeFactory(this.currentState.document);
  }

  get treeWalkerFactory(): TreeWalkerFactory {
    return GenTreeWalker;
  }

  get datastore(): Datastore {
    return this.currentState.datastore;
  }

  get util(): EditorUtils {
    throw new Error('Method not implemented.');
  }

  get ownMarks(): Set<Mark<AttributeSpec>> {
    return this.getMarksFor(this.name);
  }

  get modelRoot(): ModelElement {
    return this.currentState.document;
  }

  get domRoot(): Element {
    return this._view.domRoot;
  }

  get marksRegistry(): MarksRegistry {
    return this.currentState.marksRegistry;
  }

  get view(): View {
    return this._view;
  }

  createTransaction(): Transaction {
    return this.currentState.createTransaction();
  }

  perform<R>(action: (transaction: Transaction) => R): R {
    const tr = this.createTransaction();
    const result = action(tr);
    this.dispatchTransaction(tr);
    return result;
  }

  dryRun<R>(action: (transaction: Transaction) => R): R {
    const tr = this.createTransaction();
    const result = action(tr);
    return result;
  }

  dispatchTransaction(tr: Transaction): void {
    this.view.dispatch(tr);
  }

  getComponentInstances(filter?: { componentName: string }) {
    return this.currentState.inlineComponentsRegistry.getComponentInstances(
      filter
    );
  }

  createLiveMarkSet(args: LiveMarkSetArgs): LiveMarkSet {
    return new LiveMarkSet(this, args);
  }

  createModelElement(type: ElementType): ModelElement {
    return new ModelElement(type);
  }

  registerInlineComponent(component: InlineComponentSpec) {
    this.currentState.inlineComponentsRegistry.registerComponent(component);
    // this._rawEditor.registerComponent(component);
  }

  getMarksFor(owner: string): Set<Mark<AttributeSpec>> {
    return this.marksRegistry.getMarksFor(owner);
  }

  registerWidget(spec: WidgetSpec): void {
    MapUtils.setOrPush(this.currentState.widgetMap, spec.desiredLocation, {
      controller: this,
      ...spec,
    });
  }

  registerMark(spec: MarkSpec<AttributeSpec>): void {
    this.marksRegistry.registerMark(spec);
  }

  getConfig(key: string): string | null {
    return this.currentState.config.get(key) || null;
  }

  setConfig(key: string, value: string | null): void {
    this.perform((tr) => tr.setConfig(key, value));
  }

  modelToView(node: ModelNode): Node | null {
    return this._view.modelToView(this.currentState, node);
  }

  onEvent<E extends string>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ): void {
    this.currentState.eventBus.on(eventName, callback, config);
  }

  offEvent<E extends string>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ): void {
    this.currentState.eventBus.off(eventName, callback, config);
  }

  addTransactionStepListener(callback: TransactionStepListener): void {
    const tr = this.createTransaction();
    tr.addTransactionStepListener(callback);
    this.dispatchTransaction(tr);
  }

  removeTransactionStepListener(callback: TransactionStepListener): void {
    const tr = this.createTransaction();
    tr.removeTransactionStepListener(callback);
    this.dispatchTransaction(tr);
  }

  addTransactionDispatchListener(callback: TransactionDispatchListener): void {
    const tr = this.createTransaction();
    tr.addTransactionDispatchListener(callback);
    this.dispatchTransaction(tr);
  }

  removeTransactionDispatchListener(
    callback: TransactionDispatchListener
  ): void {
    const tr = this.createTransaction();
    tr.removeTransactionDispatchListener(callback);
    this.dispatchTransaction(tr);
  }
}
