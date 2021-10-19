import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import TestModel from "dummy/tests/utilities/test-model";
import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";

export default class ModelTestContext {
  rootNode!: HTMLElement;
  model!: TestModel;
  modelSelection!: ModelSelection;
  eventBus: EventBus = new EventBus();
  domSelection!: Selection;

  reset() {
    this.rootNode = document.createElement("div");
    this.rootNode.setAttribute("contenteditable", "");
    this.rootNode.setAttribute("class", "say-editor_inner say_content");
    this.model = new TestModel(this.rootNode, this.eventBus);
    this.model.read(false);
    this.modelSelection = this.model.selection;
  }
}
