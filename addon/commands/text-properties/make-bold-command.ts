import SetTextPropertyCommand from './set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    makeBold: MakeBoldCommand;
  }
}
export default class MakeBoldCommand extends SetTextPropertyCommand<void> {
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ transaction }: CommandContext) {
    this.setTextProperty(
      transaction,
      'bold',
      true,
      transaction.workingCopy.selection
    );
  }
}
