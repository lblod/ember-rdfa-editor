import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export default class RemoveUnderlineCommand extends SetTextPropertyCommand {
  name = 'remove-underline';
  @logExecute
  execute() {
    super.setProperty('underline', false);
  }
}
