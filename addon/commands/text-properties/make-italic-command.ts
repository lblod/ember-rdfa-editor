import SetTextPropertyCommand from './set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    makeItalic: MakeItalicCommand;
  }
}
export default class MakeItalicCommand extends SetTextPropertyCommand<void> {
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ transaction }: CommandContext) {
    super.setTextProperty(
      transaction,
      'italic',
      true,
      transaction.workingCopy.selection
    );
  }
}
