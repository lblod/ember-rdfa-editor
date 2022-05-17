import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import MarksRegistry from '../model/marks-registry';
import Command, {
  CommandMap,
  CommandName,
} from '@lblod/ember-rdfa-editor/commands/command';
import InsertTextCommand from '@lblod/ember-rdfa-editor/commands/insert-text-command';
import Transaction from './transaction';

export interface StateArgs {
  document: ModelElement;
  selection: ModelSelection;
  plugins: EditorPlugin[];
  commands: Record<CommandName, CommandMap[CommandName]>;
  marksRegistry: MarksRegistry;
  previousState?: State | null;
}

export default interface State {
  document: ModelElement;
  selection: ModelSelection;
  plugins: EditorPlugin[];
  commands: Record<CommandName, CommandMap[CommandName]>;
  marksRegistry: MarksRegistry;
  previousState: State | null;
  createTransaction(): Transaction;
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
  }
  createTransaction(): Transaction {
    return new Transaction(this);
  }
}

export function defaultCommands(): Record<
  CommandName,
  CommandMap[CommandName]
> {
  return {
    'insert-text': new InsertTextCommand(),
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
