import SelectionCommand from '@lblod/ember-rdfa-editor/commands/selection-command';

export default class ReadSelectionCommand extends SelectionCommand {
  name = 'read-selection';

  constructor() {
    super(false);
  }
}
