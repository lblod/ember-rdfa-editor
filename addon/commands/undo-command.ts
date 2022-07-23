import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import { logExecute } from '../utils/logging-utils';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    undo: UndoCommand;
  }
}

export default class UndoCommand implements Command<void, void> {
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ transaction }: CommandContext): void {
    transaction.restoreSnapshot(1);
  }
}
