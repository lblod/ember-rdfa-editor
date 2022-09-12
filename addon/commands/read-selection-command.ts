import SelectionCommand from '@lblod/ember-rdfa-editor/commands/selection-command';

declare module '@lblod/ember-rdfa-editor' {
  export interface Commands {
    readSelection: ReadSelectionCommand;
  }
}
export default class ReadSelectionCommand extends SelectionCommand {
  constructor() {
    super(false);
  }
}
