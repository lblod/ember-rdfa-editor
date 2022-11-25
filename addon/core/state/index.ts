import { Commands } from '@lblod/ember-rdfa-editor';
import InsertTextCommand from '@lblod/ember-rdfa-editor/commands/insert-text-command';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelSelection from '@lblod/ember-rdfa-editor/core/model/model-selection';
import { InitializedPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import AddMarkToRangeCommand from '../../commands/add-mark-to-range-command';
import AddMarkToSelectionCommand from '../../commands/add-mark-to-selection-command';
import DeleteSelectionCommand from '../../commands/delete-selection-command';
import IndentListCommand from '../../commands/indent-list-command';
import InsertComponentCommand from '../../commands/insert-component-command';
import InsertHtmlCommand from '../../commands/insert-html-command';
import InsertNewLiCommand from '../../commands/insert-newLi-command';
import InsertNewLineCommand from '../../commands/insert-newLine-command';
import InsertTableColumnAfterCommand from '../../commands/insert-table-column-after-command';
import InsertTableColumnBeforeCommand from '../../commands/insert-table-column-before-command';
import InsertTableCommand from '../../commands/insert-table-command';
import InsertTableRowAboveCommand from '../../commands/insert-table-row-above-command';
import InsertTableRowBelowCommand from '../../commands/insert-table-row-below-command';
import InsertXmlCommand from '../../commands/insert-xml-command';
import MakeListCommand from '../../commands/make-list-command';
import MatchTextCommand from '../../commands/match-text-command';
import AddTypeCommand from '../../commands/node-properties/add-type-command';
import RemovePropertyCommand from '../../commands/node-properties/remove-property-command';
import RemoveTypeCommand from '../../commands/node-properties/remove-type-command';
import SetPropertyCommand from '../../commands/node-properties/set-property-command';
import ReadSelectionCommand from '../../commands/read-selection-command';
import RemoveCommand from '../../commands/remove-command';
import RemoveComponentCommand from '../../commands/remove-component-command';
import RemoveListCommand from '../../commands/remove-list-command';
import RemoveMarkFromRangeCommand from '../../commands/remove-mark-from-range-command';
import RemoveMarkFromSelectionCommand from '../../commands/remove-mark-from-selection-command';
import RemoveMarksFromRangesCommand from '../../commands/remove-marks-from-ranges-command';
import RemoveTableColumnCommand from '../../commands/remove-table-column-command';
import RemoveTableCommand from '../../commands/remove-table-command';
import RemoveTableRowCommand from '../../commands/remove-table-row-command';
import UndoCommand from '../../commands/undo-command';
import UnindentListCommand from '../../commands/unindent-list-command';
import { defaultKeyMap, KeyMap } from '../../input/keymap';
import { InternalWidgetSpec, WidgetLocation } from '../controllers/controller';
import InlineComponentsRegistry from '../model/inline-components/inline-components-registry';
import { highlightMarkSpec } from '../model/marks/mark';
import MarksRegistry from '../model/marks/marks-registry';
import {
  emptyLegacyDatastore,
  legacyDatastore,
  LegacyStore,
} from '../../utils/datastore/datastore';
import { boldMarkSpec } from '../../plugins/basic-styles/marks/bold';
import { italicMarkSpec } from '../../plugins/basic-styles/marks/italic';
import { strikethroughMarkSpec } from '../../plugins/basic-styles/marks/strikethrough';
import { underlineMarkSpec } from '../../plugins/basic-styles/marks/underline';
import {
  getPathFromRoot,
  isElement,
  isTextNode,
} from '../../utils/dom-helpers';
import { NotImplementedError } from '../../utils/errors';
import Transaction, {
  TransactionDispatchListener,
  TransactionStepListener,
} from './transaction';
import EventBus from '@lblod/ember-rdfa-editor/utils/event-bus';
import {
  HtmlReaderContext,
  readHtml,
} from '@lblod/ember-rdfa-editor/core/model/readers/html-reader';
import MarksManager from '../model/marks/marks-manager';
import RemoveMarkFromNodeCommand from '@lblod/ember-rdfa-editor/commands/remove-mark-from-node-command';
import {
  SimpleRange,
  simpleRangeToModelRange,
} from '@lblod/ember-rdfa-editor/core/model/simple-range';
import ModelNodeUtils from '@lblod/ember-rdfa-editor/utils/model-node-utils';

export interface StateArgs {
  document: ModelElement;
  selection: ModelSelection;
  plugins: InitializedPlugin[];
  transactionStepListeners: Set<TransactionStepListener>;
  transactionDispatchListeners: Set<TransactionDispatchListener>;
  commands: Partial<Commands>;
  marksRegistry: MarksRegistry;
  marksManager: MarksManager;
  inlineComponentsRegistry: InlineComponentsRegistry;
  previousState?: State | null;
  datastore: LegacyStore;
  eventBus: EventBus;
  widgetMap: Map<WidgetLocation, InternalWidgetSpec[]>;
  pathFromDomRoot: Node[];
  baseIRI: string;
  keymap?: KeyMap;
  config?: Map<string, string | null>;
}

export type InitialStateArgs = Omit<Partial<StateArgs>, 'datastore'>;

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
  commands: Partial<Commands>;
  marksRegistry: MarksRegistry;
  marksManager: MarksManager;
  inlineComponentsRegistry: InlineComponentsRegistry;
  previousState: State | null;
  widgetMap: Map<WidgetLocation, InternalWidgetSpec[]>;
  datastore: LegacyStore;
  pathFromDomRoot: Node[];
  baseIRI: string;
  keymap: KeyMap;

  createTransaction(): Transaction;

  parseNode(node: Node): NodeParseResult;

  eventBus: EventBus;
  config: Map<string, string | null>;
  transactionStepListeners: Set<TransactionStepListener>;
  transactionDispatchListeners: Set<TransactionDispatchListener>;
}

export class SayState implements State {
  document: ModelElement;
  selection: ModelSelection;
  plugins: InitializedPlugin[];
  commands: Partial<Commands>;
  datastore: LegacyStore;
  marksRegistry: MarksRegistry;
  marksManager: MarksManager;
  inlineComponentsRegistry: InlineComponentsRegistry;
  eventBus: EventBus;
  transactionStepListeners: Set<TransactionStepListener>;
  transactionDispatchListeners: Set<TransactionDispatchListener>;
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
  config: Map<string, string | null>;

  constructor(args: StateArgs) {
    const { previousState = null } = args;
    this.document = args.document;
    this.selection = args.selection;
    this.plugins = args.plugins;
    this.commands = args.commands;
    this.marksRegistry = args.marksRegistry;
    this.marksManager = args.marksManager;
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
    this.config = args.config || new Map<string, string | null>();
    this.transactionStepListeners = args.transactionStepListeners;
    this.transactionDispatchListeners = args.transactionDispatchListeners;
  }

  /**
   * Create a new @link{Transaction} with this state as its initial state.
   * */
  createTransaction(): Transaction {
    return new Transaction(this);
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

export function defaultCommands(): Partial<Commands> {
  return {
    addMarkToRange: new AddMarkToRangeCommand(),
    addMarkToSelection: new AddMarkToSelectionCommand(),
    addType: new AddTypeCommand(),
    deleteSelection: new DeleteSelectionCommand(),
    indentList: new IndentListCommand(),
    insertComponent: new InsertComponentCommand(),
    insertHtml: new InsertHtmlCommand(),
    insertNewLi: new InsertNewLiCommand(),
    insertNewLine: new InsertNewLineCommand(),
    insertTableColumnAfter: new InsertTableColumnAfterCommand(),
    insertTableColumnBefore: new InsertTableColumnBeforeCommand(),
    insertTable: new InsertTableCommand(),
    insertTableRowAbove: new InsertTableRowAboveCommand(),
    insertTableRowBelow: new InsertTableRowBelowCommand(),
    insertText: new InsertTextCommand(),
    insertXml: new InsertXmlCommand(),
    makeList: new MakeListCommand(),
    matchText: new MatchTextCommand(),
    readSelection: new ReadSelectionCommand(),
    removeComponent: new RemoveComponentCommand(),
    removeList: new RemoveListCommand(),
    removeMarkFromNode: new RemoveMarkFromNodeCommand(),
    removeMarkFromRange: new RemoveMarkFromRangeCommand(),
    removeMarkFromSelection: new RemoveMarkFromSelectionCommand(),
    removeMarksFromRanges: new RemoveMarksFromRangesCommand(),
    removeProperty: new RemovePropertyCommand(),
    removeTableColumn: new RemoveTableColumnCommand(),
    removeTableRow: new RemoveTableRowCommand(),
    removeTable: new RemoveTableCommand(),
    removeType: new RemoveTypeCommand(),
    undo: new UndoCommand(),
    unindentList: new UnindentListCommand(),
    remove: new RemoveCommand(),
    setProperty: new SetPropertyCommand(),
  };
}

export function emptyState(eventBus = new EventBus()): State {
  const document = new ModelElement('div');
  return new SayState({
    document,
    selection: new ModelSelection(),
    plugins: [],
    commands: defaultCommands(),
    config: new Map<string, string | null>(),
    marksRegistry: new MarksRegistry(),
    marksManager: new MarksManager(),
    inlineComponentsRegistry: new InlineComponentsRegistry(),
    widgetMap: new Map<WidgetLocation, InternalWidgetSpec[]>(),
    datastore: emptyLegacyDatastore(document),
    pathFromDomRoot: [],
    baseIRI: 'http://example.org',
    eventBus,
    keymap: defaultKeyMap,
    transactionStepListeners: new Set(),
    transactionDispatchListeners: new Set(),
  });
}

export function cloneState(state: State): State {
  const documentClone = state.document.clone();
  const selectionClone = state.selection.clone(documentClone);
  return new SayState({
    document: documentClone,
    marksRegistry: state.marksRegistry,
    marksManager: state.marksManager,
    inlineComponentsRegistry: state.inlineComponentsRegistry.clone(
      state.document,
      documentClone
    ),
    plugins: [...state.plugins],
    commands: state.commands,
    selection: selectionClone,
    previousState: state.previousState,
    widgetMap: state.widgetMap,
    datastore: state.datastore,
    pathFromDomRoot: state.pathFromDomRoot,
    keymap: state.keymap,
    eventBus: state.eventBus,
    transactionStepListeners: state.transactionStepListeners,
    transactionDispatchListeners: state.transactionDispatchListeners,
    baseIRI: state.baseIRI,
    config: state.config,
  });
}

export function cloneStateShallow(state: State): State {
  return new SayState({
    ...state,
  });
}

export function createState({
  document = new ModelElement('div'),
  selection = new ModelSelection(),
  plugins = [],
  commands = defaultCommands(),
  config = new Map(),
  marksRegistry = new MarksRegistry(),
  inlineComponentsRegistry = new InlineComponentsRegistry(),
  widgetMap = new Map(),
  eventBus = new EventBus(),
  pathFromDomRoot = [],
  baseIRI = window.document.baseURI,
  keymap = defaultKeyMap,
  transactionStepListeners: transactionStepListeners = new Set(),
  transactionDispatchListeners: transactionDispatchListeners = new Set(),
}: InitialStateArgs): State {
  return new SayState({
    document,
    selection,
    plugins,
    commands,
    config,
    marksRegistry,
    marksManager: MarksManager.fromDocument(document),
    inlineComponentsRegistry,
    widgetMap,
    eventBus,
    datastore: legacyDatastore({
      pathFromDomRoot,
      baseIRI,
      root: document,
    }),
    pathFromDomRoot,
    baseIRI,
    keymap,
    transactionStepListeners: transactionStepListeners,
    transactionDispatchListeners: transactionDispatchListeners,
  });
}

export function createNewStateFromHtmlElement(element: Element) {
  const marksRegistry = new MarksRegistry();
  const inlineComponentsRegistry = new InlineComponentsRegistry();
  const doc = readHtml(
    element,
    new HtmlReaderContext({
      marksRegistry,
      inlineComponentsRegistry,
    })
  )[0] as ModelElement;
  return createState({
    document: doc,
    marksRegistry,
    inlineComponentsRegistry,
    pathFromDomRoot: getPathFromRoot(element, false),
  });
}

export function cloneStateInRange(
  range: SimpleRange,
  initialState: State
): State {
  const newRoot = cloneDocumentInRange(range, initialState.document);
  const resultState = cloneStateShallow(initialState);
  resultState.document = newRoot;
  return resultState;
}

export function cloneDocumentInRange(
  range: SimpleRange,
  document: ModelElement
): ModelElement {
  const resolvedRange = simpleRangeToModelRange(range, document);
  const commonAncestor = resolvedRange.getCommonAncestor();
  return ModelNodeUtils.replaceNodeInTree(
    document,
    commonAncestor,
    commonAncestor.clone()
  );
}
