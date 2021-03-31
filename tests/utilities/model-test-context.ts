import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

export default class ModelTestContext {

  rootNode!: HTMLElement;
  model!: Model;
  modelSelection!: ModelSelection;
  domSelection!: Selection;
  testRoot!: HTMLElement;

  reset() {
    this.testRoot = document.getElementById("ember-testing")!;
    if(this.testRoot) {
      for (const child of this.testRoot.childNodes) {
        this.testRoot.removeChild(child);
      }
    }

    this.rootNode = document.createElement("div");
    this.testRoot.appendChild(this.rootNode);
    this.model = new Model();
    this.model.rootNode = this.rootNode;
    this.model.read();
    this.model.write();
    this.modelSelection = this.model.selection;
    this.domSelection = getWindowSelection();

  }
  destroy() {
    if(this.testRoot) {
      for (const child of this.testRoot.childNodes) {
        this.testRoot.removeChild(child);
      }
    }

  }
}
