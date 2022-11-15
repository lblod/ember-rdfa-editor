import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/errors';
import XmlElementWriter from '@lblod/ember-rdfa-editor/core/model/writers/xml-element-writer';
import XmlTextWriter from '@lblod/ember-rdfa-editor/core/model/writers/xml-text-writer';
import XmlInlineComponentWriter from './xml-inline-component-writer';
import { XmlWriterContext } from '@lblod/ember-rdfa-editor/core/model/writers/xml-writer';

export default class XmlNodeWriter {
  constructor(private document: XMLDocument) {}

  write(modelNode: ModelNode, context: XmlWriterContext): Node {
    let result: Element;
    if (ModelNode.isModelElement(modelNode)) {
      context.currentPos += 1;
      const writer = new XmlElementWriter(this.document);
      result = writer.write(modelNode, context);
      context.currentPos += 1;
    } else if (ModelNode.isModelText(modelNode)) {
      const writer = new XmlTextWriter(this.document);
      context.currentPos += modelNode.content.length;
      result = writer.write(modelNode, context);
    } else if (ModelNode.isModelInlineComponent(modelNode)) {
      const writer = new XmlInlineComponentWriter(this.document);
      context.currentPos += 2;
      result = writer.write(modelNode, context);
    } else {
      throw new NotImplementedError();
    }
    return result;
  }
}
