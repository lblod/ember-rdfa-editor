import { ModelInlineComponent } from '../model/inline-components/model-inline-component';
import { logExecute } from '../utils/logging-utils';
import Command, { CommandContext } from './command';

export interface RemoveComponentCommandArgs {
  component: ModelInlineComponent;
}
export default class RemoveComponentCommand
  implements Command<RemoveComponentCommandArgs, void>
{
  name = 'remove-component';

  arguments = ['component'];

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
