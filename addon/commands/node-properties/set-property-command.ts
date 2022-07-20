import Command, {
  CommandContext,
} from '@lblod/ember-rdfa-editor/commands/command';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
export interface SetPropertyCommandArgs {
  property: string;
  value: string;
  element: ModelElement;
}
export default class SetPropertyCommand
  implements Command<SetPropertyCommandArgs, void>
{
  arguments: string[] = ['property', 'value', 'element'];
  name = 'set-property';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute(
    { state, dispatch }: CommandContext,
    { property, value, element }: SetPropertyCommandArgs
  ) {
    const tr = state.createTransaction();
    tr.setProperty(element, property, value);
    dispatch(tr);
  }
}
