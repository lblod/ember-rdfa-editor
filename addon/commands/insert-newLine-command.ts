import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelElement from "../model/model-element";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";


export default class InsertNewLineCommand extends Command {
  name = "insert-newLine";

  constructor(model: Model) {
    super(model);
  }

  canExecute(): boolean {
    return true;
  }

  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if(!range) {
      throw new MisbehavedSelectionError();
    }
    const br = new ModelElement("br");
    this.model.change(mutator => {
      mutator.insertNodes(range, br);
      const cursorPos = ModelPosition.fromAfterNode(br);
      const newRange = new ModelRange(cursorPos, cursorPos);
      this.model.selectRange(newRange);
    });
  }
}
