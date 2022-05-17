import Command from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import {
  MisbehavedSelectionError,
  ModelError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { AttributeSpec } from '@lblod/ember-rdfa-editor/model/mark';

export default class RemoveMarkFromSelectionCommand extends Command<
  [string, AttributeSpec],
  void
> {
  name = 'remove-mark-from-selection';

  constructor(model: Model) {
    super(model);
  }

  execute(name: string, attributes: AttributeSpec): void {
    const selection = this.model.selection;
    if (selection.isCollapsed) {
      this.model.selection.removeMarkByName(name);
      this.model.rootNode.focus();
      this.model.emitSelectionChanged();
    } else {
      const spec = this.model.marksRegistry.lookupMark(name);
      if (!ModelSelection.isWellBehaved(selection)) {
        throw new MisbehavedSelectionError();
      }
      if (spec) {
        this.model.change((mutator) => {
          const resultRange = mutator.removeMark(
            selection.lastRange,
            spec,
            attributes
          );
          this.model.selectRange(resultRange);
        });
      } else {
        throw new ModelError(`Unrecognized mark: ${name}`);
      }
    }
  }
}
