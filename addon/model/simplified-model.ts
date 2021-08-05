import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";

export default class SimplifiedModel {
  rootModelNode: ModelElement;
  modelSelection: ModelSelection;

  constructor(rootModelNode: ModelElement, modelSelection: ModelSelection) {
    this.rootModelNode = rootModelNode;
    this.modelSelection = modelSelection;
  }

  sameAs(other: SimplifiedModel) {
    return this.rootModelNode.sameAs(other.rootModelNode)
      && this.modelSelection.sameAs(other.modelSelection);
  }
}
