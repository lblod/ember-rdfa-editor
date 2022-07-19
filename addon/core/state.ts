import {
  CommandMap,
  CommandName,
} from '@lblod/ember-rdfa-editor/commands/command';
import InsertTextCommand from '@lblod/ember-rdfa-editor/commands/insert-text-command';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { InitializedPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import AddMarkToRangeCommand from '../commands/add-mark-to-range-command';
import AddMarkToSelectionCommand from '../commands/add-mark-to-selection-command';
import DeleteSelectionCommand from '../commands/delete-selection-command';
import IndentListCommand from '../commands/indent-list-command';
import InsertComponentCommand from '../commands/insert-component-command';
import InsertHtmlCommand from '../commands/insert-html-command';
import InsertNewLiCommand from '../commands/insert-newLi-command';
import InsertNewLineCommand from '../commands/insert-newLine-command';
import InsertTableColumnAfterCommand from '../commands/insert-table-column-after-command';
import InsertTableColumnBeforeCommand from '../commands/insert-table-column-before-command';
import InsertTableCommand from '../commands/insert-table-command';
import InsertTableRowAboveCommand from '../commands/insert-table-row-above-command';
import InsertTableRowBelowCommand from '../commands/insert-table-row-below-command';
import InsertXmlCommand from '../commands/insert-xml-command';
import MakeListCommand from '../commands/make-list-command';
import MatchTextCommand from '../commands/match-text-command';
import AddTypeCommand from '../commands/node-properties/add-type-command';
import RemovePropertyCommand from '../commands/node-properties/remove-property-command';
import RemoveTypeCommand from '../commands/node-properties/remove-type-command';
import SetPropertyCommand from '../commands/node-properties/set-property-command';
import ReadSelectionCommand from '../commands/read-selection-command';
import RemoveCommand from '../commands/remove-command';
import RemoveComponentCommand from '../commands/remove-component-command';
import RemoveListCommand from '../commands/remove-list-command';
import RemoveMarkCommand from '../commands/remove-mark-command';
import RemoveMarkFromRangeCommand from '../commands/remove-mark-from-range-command';
import RemoveMarkFromSelectionCommand from '../commands/remove-mark-from-selection-command';
import RemoveMarksFromRangesCommand from '../commands/remove-marks-from-ranges-command';
import RemoveTableColumnCommand from '../commands/remove-table-column-command';
import RemoveTableCommand from '../commands/remove-table-command';
import RemoveTableRowCommand from '../commands/remove-table-row-command';
import UndoCommand from '../commands/undo-command';
import UnindentListCommand from '../commands/unindent-list-command';
import { defaultKeyMap, KeyMap } from '../input/keymap';
import { InternalWidgetSpec, WidgetLocation } from '../model/controller';
import InlineComponentsRegistry from '../model/inline-components/inline-components-registry';
import { highlightMarkSpec } from '../model/mark';
import MarksRegistry from '../model/marks-registry';
import Datastore, { EditorStore } from '../model/util/datastore/datastore';
import { boldMarkSpec } from '../plugins/basic-styles/marks/bold';
import { italicMarkSpec } from '../plugins/basic-styles/marks/italic';
import { strikethroughMarkSpec } from '../plugins/basic-styles/marks/strikethrough';
import { underlineMarkSpec } from '../plugins/basic-styles/marks/underline';
import { isElement, isTextNode } from '../utils/dom-helpers';
import { NotImplementedError } from '../utils/errors';
import EventBus from '../utils/event-bus';
import TransactionOperationNotifier from '../utils/transaction-operation-notifier';
import Transaction from './transaction';

export interface StateArgs {
  document: ModelElement;
  selection: ModelSelection;
  plugins: InitializedPlugin[];
  commands: CommandMap;
  marksRegistry: MarksRegistry;
  inlineComponentsRegistry: InlineComponentsRegistry;
  previousState?: State | null;
  datastore: Datastore;
  widgetMap: Map<WidgetLocation, InternalWidgetSpec[]>;
  pathFromDomRoot: Node[];
  baseIRI: string;
  keymap?: KeyMap;
  eventBus: EventBus;
  transactionOperationNotifier: TransactionOperationNotifier;
}
export interface NodeParseResult {
  type: 'mark' | 'text' | 'element';
}

/**
 * This interface represents all state needed for the editor to draw itself.
 * The main assumption is that this state is immutable, and is treated as being a simple value in all parts of the codebase.
 * This immutability is not enforced because that would be costly to do in javascript.
 * Performing editing actions, or changing any settings means creating a new state derived from the previous one,
 * and setting it as the active editor state, and then updating the view if necessary.
 * This is pretty much always done using a @link {Transaction}
 * */
export default interface State {
  document: ModelElement;
  selection: ModelSelection;
  plugins: InitializedPlugin[];
  commands: CommandMap;
  marksRegistry: MarksRegistry;
  inlineComponentsRegistry: InlineComponentsRegistry;
  previousState: State | null;
  widgetMap: Map<WidgetLocation, InternalWidgetSpec[]>;
  datastore: Datastore;
  pathFromDomRoot: Node[];
  baseIRI: string;
  keymap: KeyMap;
  createTransaction(): Transaction;
  parseNode(node: Node): NodeParseResult;
  eventBus: EventBus;
  transactionOperationNotifier: TransactionOperationNotifier;
}
export class SayState implements State {
  document: ModelElement;
  selection: ModelSelection;
  plugins: InitializedPlugin[];
  commands: CommandMap;
  datastore: Datastore;
  marksRegistry: MarksRegistry;
  inlineComponentsRegistry: InlineComponentsRegistry;
  eventBus: EventBus;
  transactionOperationNotifier: TransactionOperationNotifier;
  /**
   * The previous "relevant" state. This is not necessarily
   * the state directly preceding this one. It is up to the discretion
   * of the @link{Transaction} to determine whether a newly created state
   * is relevant for the history or not.
   * */
  previousState: State | null;
  widgetMap: Map<WidgetLocation, InternalWidgetSpec[]>;
  /**
   * The path from the root of the html document to the element that the editor
   * renders in. This is used to be aware of rdfa-knowledge
   * that is defined outside the editor element.
   * */
  pathFromDomRoot: Node[];
  baseIRI: string;
  /**
   * A mapping of keycodes to their handler functions
   * */
  keymap: KeyMap;
  constructor(args: StateArgs) {
    const { previousState = null } = args;
    this.document = args.document;
    this.selection = args.selection;
    this.plugins = args.plugins;
    this.commands = args.commands;
    this.marksRegistry = args.marksRegistry;
    this.inlineComponentsRegistry = args.inlineComponentsRegistry;
    this.previousState = previousState;
    this.marksRegistry.registerMark(boldMarkSpec);
    this.marksRegistry.registerMark(italicMarkSpec);
    this.marksRegistry.registerMark(underlineMarkSpec);
    this.marksRegistry.registerMark(strikethroughMarkSpec);
    this.marksRegistry.registerMark(highlightMarkSpec);
    this.datastore = args.datastore;
    this.widgetMap = args.widgetMap;
    this.pathFromDomRoot = args.pathFromDomRoot;
    this.baseIRI = args.baseIRI;
    this.keymap = args.keymap ?? defaultKeyMap;
    this.eventBus = args.eventBus;
    this.transactionOperationNotifier = args.transactionOperationNotifier;
  }
  /**
   * Create a new @link{Transaction} with this state as its initial state.
   * */
  createTransaction(): Transaction {
    return new Transaction(this, (tr, op) =>
      this.transactionOperationNotifier.notify(tr, op)
    );
  }
  /**
   * Given the current state, determine how a certain html node
   * would be interpreted. This is used for internal logic,
   * and may become private or dissapear in the future.
   * */
  parseNode(node: Node): NodeParseResult {
    const matchedMarks = this.marksRegistry.matchMarkSpec(node);
    if (matchedMarks.size) {
      return { type: 'mark' };
    } else if (isElement(node)) {
      return { type: 'element' };
    } else if (isTextNode(node)) {
      return { type: 'text' };
    } else {
      throw new NotImplementedError();
    }
  }
}

export function defaultCommands(): CommandMap {
  return {
    'add-mark-to-range': new AddMarkToRangeCommand(),
    'add-mark-to-selection': new AddMarkToSelectionCommand(),
    'add-type': new AddTypeCommand(),
    'delete-selection': new DeleteSelectionCommand(),
    'indent-list': new IndentListCommand(),
    'insert-component': new InsertComponentCommand(),
    'insert-html': new InsertHtmlCommand(),
    'insert-newLi': new InsertNewLiCommand(),
    'insert-newLine': new InsertNewLineCommand(),
    'insert-table-column-after': new InsertTableColumnAfterCommand(),
    'insert-table-column-before': new InsertTableColumnBeforeCommand(),
    'insert-table': new InsertTableCommand(),
    'insert-table-row-above': new InsertTableRowAboveCommand(),
    'insert-table-row-below': new InsertTableRowBelowCommand(),
    'insert-text': new InsertTextCommand(),
    'insert-xml': new InsertXmlCommand(),
    'make-list': new MakeListCommand(),
    'match-text': new MatchTextCommand(),
    'read-selection': new ReadSelectionCommand(),
    'remove-component': new RemoveComponentCommand(),
    'remove-list': new RemoveListCommand(),
    'remove-mark': new RemoveMarkCommand(),
    'remove-mark-from-range': new RemoveMarkFromRangeCommand(),
    'remove-mark-from-selection': new RemoveMarkFromSelectionCommand(),
    'remove-marks-from-ranges': new RemoveMarksFromRangesCommand(),
    'remove-property': new RemovePropertyCommand(),
    'remove-table-column': new RemoveTableColumnCommand(),
    'remove-table-row': new RemoveTableRowCommand(),
    'remove-table': new RemoveTableCommand(),
    'remove-type': new RemoveTypeCommand(),
    undo: new UndoCommand(),
    'unindent-list': new UnindentListCommand(),
    remove: new RemoveCommand(),
    'set-property': new SetPropertyCommand(),
  };
}
export type CommandReturn<C extends CommandName> = ReturnType<
  CommandMap[C]['execute']
>;
export type CommandArgs<C extends CommandName> = Parameters<
  CommandMap[C]['execute']
>[1];

export function emptyState(
  eventBus: EventBus,
  transactionOperationNotifier: TransactionOperationNotifier
): State {
  return new SayState({
    document: new ModelElement('div'),
    selection: new ModelSelection(),
    plugins: [],
    commands: defaultCommands(),
    marksRegistry: new MarksRegistry(),
    inlineComponentsRegistry: new InlineComponentsRegistry(),
    widgetMap: new Map<WidgetLocation, InternalWidgetSpec[]>(),
    datastore: EditorStore.empty(),
    pathFromDomRoot: [],
    baseIRI: 'http://example.org',
    keymap: defaultKeyMap,
    eventBus: eventBus,
    transactionOperationNotifier: transactionOperationNotifier,
  });
}

export function cloneState(state: State): State {
  const documentClone = state.document.clone();
  const selectionClone = state.selection.clone(documentClone);
  return new SayState({
    document: documentClone,
    marksRegistry: state.marksRegistry,
    inlineComponentsRegistry: state.inlineComponentsRegistry,
    plugins: [...state.plugins],
    commands: state.commands,
    selection: selectionClone,
    previousState: state.previousState,
    widgetMap: state.widgetMap,
    datastore: state.datastore,
    pathFromDomRoot: state.pathFromDomRoot,
    keymap: state.keymap,
    eventBus: state.eventBus,
    transactionOperationNotifier: state.transactionOperationNotifier,
    baseIRI: state.baseIRI,
  });
}
