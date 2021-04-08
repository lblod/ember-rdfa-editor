import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelElement from "../model/model-element";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";


export default class InsertNewLineCommand extends Command {
  name = "insert-newLine";

  constructor(model: Model) {
    super(model);
  }

  canExecute(_selection: ModelSelection = this.model.selection): boolean {
    return true;
  }

  execute(): void {

    const selection = this.model.selection;
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }
    const range = selection.lastRange;
    const br = new ModelElement("br");
    this.model.change(mutator => {
      mutator.insertNodes(range, br);
    }, false);
    const cursorPos = ModelPosition.fromAfterNode(br);
    this.model.selection.selectRange(new ModelRange(cursorPos, cursorPos));
    this.model.writeSelection();
  }
}
