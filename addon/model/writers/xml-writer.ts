import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import ModelNode from '@lblod/ember-rdfa-editor/model/nodes/model-node';
import XmlNodeWriter from '@lblod/ember-rdfa-editor/model/writers/xml-node-writer';

export default class XmlWriter implements Writer<ModelNode, Node> {
  write(modelNode: ModelNode): Node {
    const document = new Document();
    const writer = new XmlNodeWriter(document);

    return writer.write(modelNode);
  }
}
