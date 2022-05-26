import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import { logExecute } from '../utils/logging-utils';

export default class UndoCommand implements Command<void, void> {
  name = 'undo';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ state, dispatch }: CommandContext): void {
    const tr = state.createTransaction();
    tr.restoreSnapshot(1);
    dispatch(tr);
  }
}
