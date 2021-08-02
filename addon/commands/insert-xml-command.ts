import Command from "@lblod/ember-rdfa-editor/commands/command";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {parseXml} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

/**
 * Allows you to insert model nodes from an xml string.
 * Particularly useful for testing and debugging.
 */
export default class InsertXmlCommand extends Command {
  name = "insert-xml";
  constructor(model: Model) {
    super(model);
  }

  @logExecute
  execute(xml: string, range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const parsed = parseXml(xml);
    this.model.change(mutator => {
      const newRange = mutator.insertNodes(range, parsed.root);
      this.model.selectRange(newRange);
    });
  }
}
