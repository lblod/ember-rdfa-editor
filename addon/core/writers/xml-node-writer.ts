import Writer from "@lblod/ember-rdfa-editor/core/writers/writer";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/util/errors";
import XmlElementWriter from "@lblod/ember-rdfa-editor/core/writers/xml-element-writer";
import XmlTextWriter from "@lblod/ember-rdfa-editor/core/writers/xml-text-writer";

export default class XmlNodeWriter implements Writer<ModelNode, Node> {
  constructor(private document: XMLDocument) {}

  write(modelNode: ModelNode): Node {
    if (ModelNode.isModelElement(modelNode)) {
      const writer = new XmlElementWriter(this.document);
      return writer.write(modelNode);
    } else if (ModelNode.isModelText(modelNode)) {
      const writer = new XmlTextWriter(this.document);
      return writer.write(modelNode);
    } else {
      throw new NotImplementedError();
    }
  }
}

