import SetTextPropertyCommand from './set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { CommandContext } from '../command';

export default class MakeItalicCommand extends SetTextPropertyCommand<void> {
  name = 'make-italic';

  canExecute(): boolean {
    return true;
  }

  @logExecute
  execute({ state, dispatch }: CommandContext) {
    const tr = state.createTransaction();
    super.setTextProperty(tr, 'italic', true, state.selection);
    dispatch(tr);
  }
}
