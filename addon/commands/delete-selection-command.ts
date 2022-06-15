import SelectionCommand from '@lblod/ember-rdfa-editor/commands/selection-command';

export default class DeleteSelectionCommand extends SelectionCommand {
  name = 'delete-selection';
  arguments = [];
  constructor() {
    super(true);
  }
}
