import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";

export default class ModelTestContext {

  rootNode!: HTMLElement;
  model!: Model;
  modelSelection!: ModelSelection;
  domSelection!: Selection;

  reset() {
    this.rootNode = document.createElement("div");
    this.model = new Model(this.rootNode);
    this.model.read(false);
    this.modelSelection = this.model.selection;

  }
}
