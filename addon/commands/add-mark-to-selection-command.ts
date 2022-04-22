import Command from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import {
  AttributeSpec,
  Mark,
  Serializable,
} from '@lblod/ember-rdfa-editor/model/mark';
import {
  MisbehavedSelectionError,
  ModelError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';

export default class AddMarkToSelectionCommand extends Command<
  [string, Record<string, Serializable>],
  void
> {
  name = 'add-mark-to-selection';

  constructor(model: Model) {
    super(model);
  }

  execute(
    markName: string,
    markAttributes: Record<string, Serializable> = {}
  ): void {
    const selection = this.model.selection;
    const spec = this.model.marksRegistry.lookupMark(markName);
    if (spec) {
      if (selection.isCollapsed) {
        selection.addMark(new Mark<AttributeSpec>(spec, markAttributes));
        this.model.rootNode.focus();
        this.model.emitSelectionChanged();
      } else {
        if (!ModelSelection.isWellBehaved(selection)) {
          throw new MisbehavedSelectionError();
        }
        this.model.change((mutator) => {
          const resultRange = mutator.addMark(
            selection.lastRange,
            spec,
            markAttributes
          );
          this.model.selectRange(resultRange);
        });
      }
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
