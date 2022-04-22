import Command from '@lblod/ember-rdfa-editor/commands/command';
import Model from '@lblod/ember-rdfa-editor/model/model';
import {
  AttributeSpec,
  Mark,
  Serializable,
} from '@lblod/ember-rdfa-editor/model/mark';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';

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
    const spec = this.model.marksRegistry.lookupMark(markName);
    if (spec) {
      this.model.selection.addMark(
        new Mark<AttributeSpec>(spec, markAttributes)
      );
      this.model.rootNode.focus();
    } else {
      throw new ModelError(`Unrecognized mark: ${markName}`);
    }
  }
}
