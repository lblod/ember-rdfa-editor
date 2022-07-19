import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import { logExecute } from '../utils/logging-utils';

export default class UndoCommand implements Command<void, void> {
  name = 'undo';
  arguments: string[] = [];

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ transaction }: CommandContext): void {
    transaction.restoreSnapshot(1);
  }
}
