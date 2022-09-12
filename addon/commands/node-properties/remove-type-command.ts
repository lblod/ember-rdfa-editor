import ModelElement from '@lblod/ember-rdfa-editor/model/nodes/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    removeType: RemoveTypeCommand;
  }
}
export interface RemoveTypeCommandArgs {
  type: string;
  element: ModelElement;
}

export default class RemoveTypeCommand
  implements Command<RemoveTypeCommandArgs, void>
{
  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    { type, element }: RemoveTypeCommandArgs
  ) {
    const oldTypeof = element.getAttribute('typeof');
    const typesArray = oldTypeof ? oldTypeof.split(' ') : [];
    const newTypeof = typesArray.filter((t) => t !== type).join(' ');
    const newNode = transaction.setProperty(element, 'typeof', newTypeof);
    transaction.selectRange(ModelRange.fromInElement(newNode, 0, 0));
    return newNode;
  }
}
