import SetTextPropertyCommand from './set-text-property-command';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export default class MakeHighlightCommand extends SetTextPropertyCommand {
  name = 'make-highlight';

  @logExecute
  execute(selection?: ModelSelection) {
    this.setTextProperty('highlighted', true, selection);
  }
}
