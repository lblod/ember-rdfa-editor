import SetPropertyCommand from './set-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export default class MakeItalicCommand extends SetPropertyCommand {
  name = 'make-italic';

  @logExecute
  execute() {
    super.setProperty('italic', true);
  }
}
