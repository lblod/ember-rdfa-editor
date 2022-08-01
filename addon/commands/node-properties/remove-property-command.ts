import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeProperty: RemovePropertyCommand;
  }
}
export interface RemovePropertyCommandArgs {
  node: ModelNode;
  property: string;
}

export default class RemovePropertyCommand
  implements Command<RemovePropertyCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    { node, property }: RemovePropertyCommandArgs
  ) {
    transaction.removeProperty(node, property);
  }
}
