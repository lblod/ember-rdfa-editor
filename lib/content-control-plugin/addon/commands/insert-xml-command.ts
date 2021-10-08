import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import {parseXmlSiblings} from "@lblod/ember-rdfa-editor/util/xml-utils"
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";
import Command from "@lblod/ember-rdfa-editor/core/command";

/**
 * Allows you to insert model nodes from an xml string.
 * Particularly useful for testing and debugging.
 */
export default class InsertXmlCommand extends Command<[string, ModelRange], void> {
  name = "insert-xml";

  constructor(model: EditorModel) {
    super(model);
  }

  execute(executedBy: string, xml: string, range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const parsedModelNodes = parseXmlSiblings(xml);
    this.model.change(executedBy, mutator => {
      const newRange = mutator.insertNodes(range, ...parsedModelNodes);
      this.model.selection.selectRange(newRange);
    });
  }
}
