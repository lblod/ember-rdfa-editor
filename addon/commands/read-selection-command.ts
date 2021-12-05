import SelectionCommand from '@lblod/ember-rdfa-editor/commands/selection-command';
import Model from '@lblod/ember-rdfa-editor/model/model';

export default class ReadSelectionCommand extends SelectionCommand {
  name = 'read-selection';

  constructor(model: Model) {
    super(model, false);
  }
}
