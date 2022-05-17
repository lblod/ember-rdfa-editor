import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import Model from '@lblod/ember-rdfa-editor/model/model';

export interface RemoveTypeCommandArgs {
  type: string;
  element: ModelElement;
}
export default class RemoveTypeCommand
  implements Command<RemoveTypeCommandArgs, void>
{
  name = 'remove-type';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { state, dispatch }: CommandContext,
    { type, element }: RemoveTypeCommandArgs
  ) {
    const oldTypeof = element.getAttribute('typeof');
    const typesArray = oldTypeof ? oldTypeof.split(' ') : [];
    const newTypeof = typesArray.filter((t) => t !== type).join(' ');
    const tr = state.createTransaction();
    const newNode = tr.setProperty(element, 'typeof', newTypeof);
    tr.selectRange(ModelRange.fromInElement(newNode, 0, 0));
    dispatch(tr);
    return newNode;
  }
}
