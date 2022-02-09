import SetTextPropertyCommand from './set-text-property-command';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export default class MakeBoldCommand extends SetTextPropertyCommand {
  name = 'make-bold';

  @logExecute
  execute() {
    this.setTextProperty('bold', true);
  }
}
