import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    setProperty: SetPropertyCommand;
  }
}
export interface SetPropertyCommandArgs {
  property: string;
  value: string;
  element: ModelElement;
}

export default class SetPropertyCommand
  implements Command<SetPropertyCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    { property, value, element }: SetPropertyCommandArgs
  ) {
    transaction.setProperty(element, property, value);
  }
}
