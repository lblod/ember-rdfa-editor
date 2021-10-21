/**
 * Immutable counterpart to a {@link Mutator}.
 * TODO
 */
import {ContentType} from "content-control-plugin/queries/get-content-query";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ImmediateModelMutator from "@lblod/ember-rdfa-editor/core/mutators/immediate-model-mutator";
import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface Inspector {
  getContent(contentType: "xml", range: ModelRange): Element | null;

  getContent(contentType: "html", range: ModelRange): Element | null;

  getContent(contentType: "modelNode", range: ModelRange): ModelNode | null;

  getContent<T extends ContentType>(contentType: T, range: ModelRange): Element | ModelNode | null;
}

export class ModelInspector implements Inspector {
  private eventBus: EventBus;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  getContent(contentType: "xml", range: ModelRange): Element | null;
  getContent(contentType: "html", range: ModelRange): Element | null;
  getContent(contentType: "modelNode", range: ModelRange): ModelNode | null;
  getContent(contentType: ContentType, range: ModelRange): Element | ModelNode | null {
    if (range.collapsed) {
      return null;
    }
    const clone = range.getCommonAncestor().clone();
    const clonedRange = range.cloneWithNewRoot(clone);

    const mutator = new ImmediateModelMutator(this.eventBus);
    const resultRange = mutator.splitRangeUntilElements(clonedRange, clone, clone);
    const resultNode = resultRange.getCommonAncestor();

    if (contentType === "modelNode") {
      return resultNode;
    } else if (contentType === "xml") {
      return resultNode.toXml() as Element;
    } else {
      return resultNode.boundNode as Element;
    }

  }

}
