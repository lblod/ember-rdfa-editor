import {
  CommandMap,
  CommandName,
} from '@lblod/ember-rdfa-editor/commands/command';
import InsertTextCommand from '@lblod/ember-rdfa-editor/commands/insert-text-command';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import AddMarkToRangeCommand from '../commands/add-mark-to-range-command';
import AddMarkToSelectionCommand from '../commands/add-mark-to-selection-command';
import DeleteSelectionCommand from '../commands/delete-selection-command';
import IndentListCommand from '../commands/indent-list-command';
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
import ReadSelectionCommand from '../commands/read-selection-command';
import RemoveListCommand from '../commands/remove-list-command';
import RemoveMarkCommand from '../commands/remove-mark-command';
import RemoveMarkFromRangeCommand from '../commands/remove-mark-from-range-command';
import RemoveMarkFromSelectionCommand from '../commands/remove-mark-from-selection-command';
import RemoveMarksFromRangesCommand from '../commands/remove-marks-from-ranges-command';
import RemoveTableColumnCommand from '../commands/remove-table-column-command';
import RemoveTableRowCommand from '../commands/remove-table-row-command';
import UndoCommand from '../commands/undo-command';
import UnindentListCommand from '../commands/unindent-list-command';
import MarksRegistry from '../model/marks-registry';
import { boldMarkSpec } from '../plugins/basic-styles/marks/bold';
import { italicMarkSpec } from '../plugins/basic-styles/marks/italic';
import { strikethroughMarkSpec } from '../plugins/basic-styles/marks/strikethrough';
import { underlineMarkSpec } from '../plugins/basic-styles/marks/underline';
import { isElement, isTextNode } from '../utils/dom-helpers';
import { NotImplementedError } from '../utils/errors';
import Transaction from './transaction';

export interface StateArgs {
  document: ModelElement;
  selection: ModelSelection;
  plugins: EditorPlugin[];
  commands: Record<CommandName, CommandMap[CommandName]>;
  marksRegistry: MarksRegistry;
  previousState?: State | null;
}
export interface NodeParseResult {
  type: 'mark' | 'text' | 'element';
}

export default interface State {
  document: ModelElement;
  selection: ModelSelection;
  plugins: EditorPlugin[];
  commands: Record<CommandName, CommandMap[CommandName]>;
  marksRegistry: MarksRegistry;
  previousState: State | null;
  createTransaction(): Transaction;
  parseNode(node: Node): NodeParseResult;
}
export class SayState implements State {
  document: ModelElement;
  selection: ModelSelection;
  plugins: EditorPlugin[];
  commands: Record<CommandName, CommandMap[CommandName]>;
  marksRegistry: MarksRegistry;
  previousState: State | null;
  constructor(args: StateArgs) {
    const { previousState = null } = args;
    this.document = args.document;
    this.selection = args.selection;
    this.plugins = args.plugins;
    this.commands = args.commands;
    this.marksRegistry = args.marksRegistry;
    this.previousState = previousState;
    this.marksRegistry.registerMark(boldMarkSpec);
    this.marksRegistry.registerMark(italicMarkSpec);
    this.marksRegistry.registerMark(underlineMarkSpec);
    this.marksRegistry.registerMark(strikethroughMarkSpec);
  }
  createTransaction(): Transaction {
    return new Transaction(this);
  }
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

export function defaultCommands(): Record<
  CommandName,
  CommandMap[CommandName]
> {
  return {
    'add-mark-to-range': new AddMarkToRangeCommand(),
    'add-mark-to-selection': new AddMarkToSelectionCommand(),
    'delete-selection': new DeleteSelectionCommand(),
    'indent-list': new IndentListCommand(),
    'insert-html': new InsertHtmlCommand(),
    'insert-newLi': new InsertNewLiCommand(),
    'insert-newLine': new InsertNewLineCommand(),
    'insert-table-column-afer': new InsertTableColumnAfterCommand(),
    'insert-table-column-before': new InsertTableColumnBeforeCommand(),
    'insert-table': new InsertTableCommand(),
    'insert-table-row-above': new InsertTableRowAboveCommand(),
    'insert-table-row-below': new InsertTableRowBelowCommand(),
    'insert-text': new InsertTextCommand(),
    'insert-xml': new InsertXmlCommand(),
    'make-list': new MakeListCommand(),
    'match-text': new MatchTextCommand(),
    'read-selection': new ReadSelectionCommand(),
    'remove-list': new RemoveListCommand(),
    'remove-mark': new RemoveMarkCommand(),
    'remove-mark-from-range': new RemoveMarkFromRangeCommand(),
    'remove-mark-from-selection': new RemoveMarkFromSelectionCommand(),
    'remove-marks-from-ranges': new RemoveMarksFromRangesCommand(),
    'remove-table-column': new RemoveTableColumnCommand(),
    'remove-table-row': new RemoveTableRowCommand(),
    undo: new UndoCommand(),
    'unindent-list': new UnindentListCommand(),
  };
}

export function emptyState(): State {
  return new SayState({
    document: new ModelElement('div'),
    selection: new ModelSelection(),
    plugins: [],
    commands: defaultCommands(),
    marksRegistry: new MarksRegistry(),
  });
}

export function cloneState(state: State): State {
  const documentClone = state.document.clone();
  const selectionClone = state.selection.clone(documentClone);
  return new SayState({
    document: documentClone,
    marksRegistry: state.marksRegistry,
    plugins: [...state.plugins],
    commands: state.commands,
    selection: selectionClone,
    previousState: state.previousState,
  });
}
