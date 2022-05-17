import SelectionCommand from '@lblod/ember-rdfa-editor/commands/selection-command';
import Model from '@lblod/ember-rdfa-editor/model/model';

export default class DeleteSelectionCommand extends SelectionCommand {
  name = 'delete-selection';

  constructor() {
    super(true);
  }
}
