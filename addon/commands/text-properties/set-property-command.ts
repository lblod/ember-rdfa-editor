import EditorProperty from "../../utils/ce/editor-property";
import Command from "../command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";

export default abstract class SetPropertyCommand extends Command {
  protected property: EditorProperty;
  constructor(model: Model, property: EditorProperty) {
    super(model);
    this.property = property;
  }
  execute() {
    throw new NotImplementedError();
  }
}
