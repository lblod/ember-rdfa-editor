import { View } from '@lblod/ember-rdfa-editor/core/view';
import State from '@lblod/ember-rdfa-editor/core/state';
import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import {
  ModelRangeFactory,
  RangeFactory,
} from '@lblod/ember-rdfa-editor/core/model/model-range';
import GenTreeWalker, {
  TreeWalkerFactory,
} from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import Datastore from '@lblod/ember-rdfa-editor/utils/datastore/datastore';
import { Mark, MarkSpec } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import { AttributeSpec } from '@lblod/ember-rdfa-editor/utils/render-spec';
import ModelElement, {
  ElementType,
} from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import MarksRegistry from '@lblod/ember-rdfa-editor/core/model/marks/marks-registry';
import Transaction, {
  TransactionDispatchListener,
  TransactionStepListener,
} from '@lblod/ember-rdfa-editor/core/state/transaction';
import LiveMarkSet, {
  LiveMarkSetArgs,
} from '@lblod/ember-rdfa-editor/core/model/marks/live-mark-set';
import { InlineComponentSpec } from '@lblod/ember-rdfa-editor/core/model/inline-components/model-inline-component';
import MapUtils from '@lblod/ember-rdfa-editor/utils/map-utils';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import {
  EditorEventListener,
  ListenerConfig,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import Controller, {
  WidgetSpec,
} from '@lblod/ember-rdfa-editor/core/controllers/controller';
import { toFilterSkipFalse } from '@lblod/ember-rdfa-editor/utils/model-tree-walker';

export interface EditorUtils {
  toFilterSkipFalse: typeof toFilterSkipFalse;
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
    return this.marksRegistry.getMarksByOwner(owner);
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
