import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import MarksRegistry from '../model/marks-registry';
import Command, {
  CommandMap,
  CommandName,
} from '@lblod/ember-rdfa-editor/commands/command';
import InsertTextCommand from '@lblod/ember-rdfa-editor/commands/insert-text-command';

export default interface State {
  document: ModelElement;
  selection: ModelSelection;
  plugins: EditorPlugin[];
  commands: Record<CommandName, CommandMap[CommandName]>;
  marksRegistry: MarksRegistry;
}

function defaultCommands(): Record<CommandName, CommandMap[CommandName]> {
  return {
    'insert-text': new InsertTextCommand(),
  };
}

export function emptyState(): State {
  return {
    document: new ModelElement('div'),
    selection: new ModelSelection(),
    plugins: [],
    commands: defaultCommands(),
    marksRegistry: new MarksRegistry(),
  };
}

export function cloneState(state: State): State {
  const documentClone = state.document.clone();
  const selectionClone = state.selection.clone(documentClone);
  return {
    document: documentClone,
    marksRegistry: state.marksRegistry,
    plugins: [...state.plugins],
    commands: state.commands,
    selection: selectionClone,
  };
}
