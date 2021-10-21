import Command from "@lblod/ember-rdfa-editor/core/command";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/util/errors";
import {NON_BREAKING_SPACE, SPACE} from "@lblod/ember-rdfa-editor/util/constants";
import {Mutator} from "@lblod/ember-rdfa-editor/core/mutator";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";

export default class InsertTextCommand extends Command<[string, ModelRange | null], void> {
  name = "insert-text";

  constructor(model: EditorModel) {
    super(model);
  }

  execute(source: string, text: string, range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    this.model.change(source, (mutator: Mutator): ModelElement | void => {
      if (text.charAt(0) === SPACE) {
        const charBefore = range.start.charactersBefore(1);
        if (charBefore === SPACE) {
          text = NON_BREAKING_SPACE + text;
          range.start = range.start.shiftedBy(-1);
        }
      }

      const resultRange = mutator.insertText(range, text);
      const commonAncestor = resultRange.getCommonAncestor();
      resultRange.collapse();
      this.model.selection.selectRange(resultRange);

      return commonAncestor;
    });
  }
}
