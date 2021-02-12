import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "../model/model-node";
import ModelElement from "../model/model-element";
import {MisbehavedSelectionError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {listTypes} from "@lblod/ember-rdfa-editor/model/util/constants";

export default class RemoveListCommand extends Command {
  name = "insert-newLine";

  constructor(model: Model) {
    super(model);
  }

  execute(selection: ModelSelection = this.model.selection){
    if(!ModelSelection.isWellBehaved(selection)) {

      throw new MisbehavedSelectionError();
    }
  }
}
