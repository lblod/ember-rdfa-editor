import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export default class RemoveBoldCommand extends SetTextPropertyCommand {
  name = 'remove-bold';

  @logExecute
  execute() {
    super.setProperty('bold', false);
  }
}
