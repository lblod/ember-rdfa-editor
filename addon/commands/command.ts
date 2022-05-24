import InsertTextCommand from '@lblod/ember-rdfa-editor/commands/insert-text-command';
import { Dispatch } from '../core/editor';
import State from '../core/state';
import AddMarkToRangeCommand from './add-mark-to-range-command';
import AddMarkToSelectionCommand from './add-mark-to-selection-command';
import DeleteSelectionCommand from './delete-selection-command';
import IndentListCommand from './indent-list-command';
import InsertHtmlCommand from './insert-html-command';
import InsertNewLiCommand from './insert-newLi-command';
import InsertNewLineCommand from './insert-newLine-command';
import InsertTableColumnAfterCommand from './insert-table-column-after-command';
import InsertTableColumnBeforeCommand from './insert-table-column-before-command';
import InsertTableCommand from './insert-table-command';
import InsertTableRowAboveCommand from './insert-table-row-above-command';
import InsertTableRowBelowCommand from './insert-table-row-below-command';
import InsertXmlCommand from './insert-xml-command';
import MakeListCommand from './make-list-command';
import MatchTextCommand from './match-text-command';
import ReadSelectionCommand from './read-selection-command';
import RemoveListCommand from './remove-list-command';
import RemoveMarkCommand from './remove-mark-command';
import RemoveMarkFromRangeCommand from './remove-mark-from-range-command';
import RemoveMarkFromSelectionCommand from './remove-mark-from-selection-command';
import RemoveMarksFromRangesCommand from './remove-marks-from-ranges-command';
import RemoveTableColumnCommand from './remove-table-column-command';
import RemoveTableRowCommand from './remove-table-row-command';
import UndoCommand from './undo-command';
import UnindentListCommand from './unindent-list-command';

export type CommandMap = {
  'add-mark-to-range': AddMarkToRangeCommand;
  'add-mark-to-selection': AddMarkToSelectionCommand;
  'delete-selection': DeleteSelectionCommand;
  'indent-list': IndentListCommand;
  'insert-html': InsertHtmlCommand;
  'insert-newLi': InsertNewLiCommand;
  'insert-newLine': InsertNewLineCommand;
  'insert-table-column-afer': InsertTableColumnAfterCommand;
  'insert-table-column-before': InsertTableColumnBeforeCommand;
  'insert-table-command': InsertTableCommand;
  'insert-table-row-above': InsertTableRowAboveCommand;
  'insert-table-row-below': InsertTableRowBelowCommand;
  'insert-text': InsertTextCommand;
  'insert-xml': InsertXmlCommand;
  'make-list': MakeListCommand;
  'match-text': MatchTextCommand;
  'read-selection': ReadSelectionCommand;
  'remove-list': RemoveListCommand;
  'remove-mark': RemoveMarkCommand;
  'remove-mark-from-range': RemoveMarkFromRangeCommand;
  'remove-mark-from-selection': RemoveMarkFromSelectionCommand;
  'remove-marks-from-ranges': RemoveMarksFromRangesCommand;
  'remove-table-column': RemoveTableColumnCommand;
  'remove-table-row': RemoveTableRowCommand;
  'undo-command': UndoCommand;
  'unindent-list': UnindentListCommand;
};
export type CommandName = keyof CommandMap;

export interface CommandContext {
  dispatch: Dispatch;
  state: State;
}

export default interface Command<A, R> {
  name: string;

  canExecute(context: CommandContext, args: A): boolean;

  execute(context: CommandContext, args: A): R;
}
