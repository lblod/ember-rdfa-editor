import { ModelInlineComponent } from '../core/model/inline-components/model-inline-component';
import { logExecute } from '../utils/logging-utils';
import Command, { CommandContext } from './command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeComponent: RemoveComponentCommand;
  }
}
export interface RemoveComponentCommandArgs {
  component: ModelInlineComponent;
}

export default class RemoveComponentCommand
  implements Command<RemoveComponentCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    { component }: RemoveComponentCommandArgs
  ): void {
    transaction.deleteNode(component);
  }
}
