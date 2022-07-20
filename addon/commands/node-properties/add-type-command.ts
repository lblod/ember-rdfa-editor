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
  arguments: string[] = ['type', 'element'];
  name = 'add-type';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { state, dispatch }: CommandContext,
    { type, element }: AddTypeCommandArgs
  ) {
    let oldTypeof = element.getAttribute('typeof');
    if (!oldTypeof) oldTypeof = '';
    const tr = state.createTransaction();
    const newType = `${oldTypeof} ${type}`;
    const newNode = tr.setProperty(element, 'typeof', newType);
    tr.selectRange(ModelRange.fromInElement(newNode, 0, 0));
    dispatch(tr);
  }
}
