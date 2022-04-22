import Command from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';

export default class RemoveMarkFromSelectionCommand extends Command<
  [string],
  void
> {
  name = 'remove-mark-from-selection';

  constructor(model: Model) {
    super(model);
  }

  execute(name: string): void {
    this.model.selection.removeMarkByName(name);
    this.model.rootNode.focus();
  }
}
