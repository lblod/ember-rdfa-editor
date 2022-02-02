import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export default class RemoveItalicCommand extends SetTextPropertyCommand {
  name = 'remove-italic';
  @logExecute
  execute() {
    super.setProperty('italic', false);
  }
}
