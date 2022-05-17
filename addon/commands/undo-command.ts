import Command, { CommandContext } from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import { logExecute } from '../utils/logging-utils';

export default class UndoCommand implements Command<void, void> {
  name = 'undo';


  @logExecute
  execute({state, dispatch}: CommandContext): void {
    const tr = state.createTransaction();
    tr.restoreSnapshot();
    dispatch(tr);
  }
}
