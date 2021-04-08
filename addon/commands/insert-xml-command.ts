import Command from "@lblod/ember-rdfa-editor/commands/command";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {parseXml} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import Model from "@lblod/ember-rdfa-editor/model/model";

/**
 * Allows you to insert modelnodes from an xml string
 * Particularly useful for testing and debugging
 */
export default class InsertXmlCommand extends Command {
  name: string = "insert-xml";
  constructor(model: Model) {
    super(model);
  }

  execute(xml: string): void {
    const selection = this.model.selection;
    if(!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const range = selection.lastRange;
    const parsed = parseXml(xml);
    this.model.change(mutator => {
      mutator.insertNodes(range, parsed.root);
    });


  }


}
