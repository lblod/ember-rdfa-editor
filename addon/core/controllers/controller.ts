import MarksRegistry from '@lblod/ember-rdfa-editor/core/model/marks/marks-registry';
import ModelElement, {
  ElementType,
} from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import { RangeFactory } from '@lblod/ember-rdfa-editor/core/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import Datastore from '@lblod/ember-rdfa-editor/utils/datastore/datastore';
import { TreeWalkerFactory } from '@lblod/ember-rdfa-editor/utils/gen-tree-walker';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
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
import ModelNode from '../model/nodes/model-node';
import { EditorUtils } from '@lblod/ember-rdfa-editor/core/controllers/view-controller';
import { MarkInstanceEntry } from '../model/marks/marks-manager';

export type WidgetLocation =
  | 'toolbarMiddle'
  | 'toolbarRight'
  | 'sidebar'
  | 'insertSidebar';

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

export default interface Controller {
  get name(): string;

  get selection(): ModelSelection;

  get rangeFactory(): RangeFactory;

  get treeWalkerFactory(): TreeWalkerFactory;

  get datastore(): Datastore;

  get util(): EditorUtils;

  get ownMarks(): Set<MarkInstanceEntry>;

  get modelRoot(): ModelElement;

  get marksRegistry(): MarksRegistry;

  get view(): View;

  get currentState(): State;

  getMarksFor(owner: string): Set<MarkInstanceEntry>;

  createModelElement(type: ElementType): ModelElement;

  createTransaction(): Transaction;

  perform<R>(action: (transaction: Transaction) => R): R;

  dryRun<R>(action: (transaction: Transaction) => R): R;

  dispatchTransaction(tr: Transaction): void;

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
