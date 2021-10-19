import {EditorPlugin} from "@lblod/ember-rdfa-editor/core/editor-plugin";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import {CustomEditorEvent, EventConfig, SelectionChangedEvent} from "@lblod/ember-rdfa-editor/core/editor-events";
import {action} from '@ember/object';
import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import {RdfaParser} from "rdfa-streaming-parser";
import dataset, {FastDataset} from "@graphy/memory.dataset.fast";

class ParentContextChangedEvent extends CustomEditorEvent<FastDataset> {
  _name = "parentContextChanged";

  constructor(config: EventConfig<FastDataset>) {
    super(config);
  }

}

export default class RdfaContextPlugin implements EditorPlugin {
  private controller!: EditorController;

  static create() {
    return new RdfaContextPlugin();
  }

  get name(): string {
    return "rdfa-context";
  }

  async initialize(controller: EditorController) {
    this.controller = controller;
    controller.onEvent("selectionChanged", this.emitParentContextChanged);
  }

  @action
  emitParentContextChanged(event: SelectionChangedEvent) {
    this.controller.emitEvent(new ParentContextChangedEvent({
      payload: this.calculateParentContext(event.payload.selection),
      owner: this.name
    }));

  }

  calculateParentContext(selection: ModelSelection): FastDataset {
    const store = dataset();
    const commonAncestor = selection.lastRange!.getCommonAncestor();
    const rootPath = [];
    for (let node: ModelElement | null = commonAncestor; node; node = node.parent) {
      rootPath.push(node);

    }
    rootPath.reverse();
    const rdfaParser = new RdfaParser();
    rdfaParser.on("data", (data) => store.add(data));
    for (const node of rootPath) {
      rdfaParser.onTagOpen(node.type, Object.fromEntries(node.attributeMap));
    }
    for (const _ of rootPath) {
      rdfaParser.onTagClose();
    }


    return store;
  }


}
