import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export default class MakeUnderlineCommand extends SetTextPropertyCommand {
  name = 'make-underline';

  @logExecute
  execute() {
    super.setTextProperty('underline', true);
  }
}
