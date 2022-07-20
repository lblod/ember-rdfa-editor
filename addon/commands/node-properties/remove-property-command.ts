import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export interface RemovePropertyCommandArgs {
  element: ModelElement;
  property: string;
}
export default class RemovePropertyCommand
  implements Command<RemovePropertyCommandArgs, void>
{
  arguments: string[] = ['element', 'property'];
  name = 'remove-property';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { state, dispatch }: CommandContext,
    { element, property }: RemovePropertyCommandArgs
  ) {
    const tr = state.createTransaction();
    tr.removeProperty(element, property);
    dispatch(tr);
  }
}
