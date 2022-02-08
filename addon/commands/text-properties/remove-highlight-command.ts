import SetTextPropertyCommand from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { logExecute } from '@lblod/ember-rdfa-editor/utils/logging-utils';

export default class RemoveHighlightCommand extends SetTextPropertyCommand {
  name = 'remove-highlight';

  @logExecute
  execute(selection?: ModelSelection) {
    this.setTextProperty('highlighted', false, selection);
  }
}
