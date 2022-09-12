import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeStrikethrough: RemoveStrikethroughCommand;
  }
}
export default class RemoveStrikethroughCommand extends SetTextPropertyCommand<void> {
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ transaction }: CommandContext) {
    super.setTextProperty(
      transaction,
      'strikethrough',
      false,
      transaction.workingCopy.selection
    );
  }
}
