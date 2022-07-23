import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import state from '@lblod/ember-rdfa-editor/core/state';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeItalic: RemoveItalicCommand;
  }
}
export default class RemoveItalicCommand extends SetTextPropertyCommand<void> {
  canExecute(): boolean {
    return true;
  }
  @logExecute
  execute({ transaction }: CommandContext) {
    super.setTextProperty(
      transaction,
      'italic',
      false,
      transaction.workingCopy.selection
    );
  }
}
