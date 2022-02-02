import SetTextPropertyCommand from './set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export default class MakeItalicCommand extends SetTextPropertyCommand {
  name = 'make-italic';

  @logExecute
  execute() {
    super.setProperty('italic', true);
  }
}
