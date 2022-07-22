import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
export interface AddTypeCommandArgs {
  type: string;
  element: ModelElement;
}

export default class AddTypeCommand
  implements Command<AddTypeCommandArgs, void>
{
  name = 'add-type';
  arguments = ['type', 'element'];

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { transaction }: CommandContext,
    { type, element }: AddTypeCommandArgs
  ) {
    let oldTypeof = element.getAttribute('typeof');
    if (!oldTypeof) oldTypeof = '';
    const newType = `${oldTypeof} ${type}`;
    const newNode = transaction.setProperty(element, 'typeof', newType);
    transaction.selectRange(ModelRange.fromInElement(newNode, 0, 0));
  }
}
