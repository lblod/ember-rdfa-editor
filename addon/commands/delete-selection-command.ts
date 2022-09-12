import SelectionCommand from '@lblod/ember-rdfa-editor/commands/selection-command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    deleteSelection: DeleteSelectionCommand;
  }
}
export default class DeleteSelectionCommand extends SelectionCommand {
  constructor() {
    super(true);
  }
}
