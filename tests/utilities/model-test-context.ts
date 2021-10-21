import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import TestModel, {TestEditor} from "dummy/tests/utilities/test-model";
import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";
import EditorController, {EditorControllerImpl} from "@lblod/ember-rdfa-editor/core/editor-controller";

export default class ModelTestContext {
  rootNode!: HTMLElement;
  model!: TestModel;
  modelSelection!: ModelSelection;
  eventBus: EventBus = new EventBus();
  domSelection!: Selection;
  editor!: TestEditor;
  controller!: EditorController;

  reset() {
    this.rootNode = document.createElement("div");
    this.rootNode.setAttribute("contenteditable", "");
    this.rootNode.setAttribute("class", "say-editor_inner say_content");
    this.model = new TestModel(this.rootNode, this.eventBus);
    this.editor = new TestEditor(this.model);
    this.controller = new EditorControllerImpl("test-controller", this.editor);
    this.model.read(false);
    this.modelSelection = this.model.selection;
  }
}
