import Command from "../command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelTreeWalker, {FilterResult} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";
import PropertyCleaner from "@lblod/ember-rdfa-editor/model/cleaners/property-cleaner";
import ImmediateModelMutator from "@lblod/ember-rdfa-editor/model/mutators/immediate-model-mutator";

export default abstract class SetPropertyCommand extends Command {
  constructor(model: Model) {
    super(model);
  }

  protected setProperty(property: TextAttribute, value: boolean, selection: ModelSelection = this.model.selection) {


    if (!ModelSelection.isWellBehaved(selection)) {
      console.info("Not executing SetPropertyCommand because selection is missing");
      return;
    }

    const range = selection.lastRange;

    this.model.change(mutator => {
      const resultRange = mutator.setTextProperty(range, property, value);
      this.model.selectRange(resultRange);
    });
  }
}
