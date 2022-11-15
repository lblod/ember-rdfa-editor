import Writer from '@lblod/ember-rdfa-editor/core/model/writers/writer';
import ModelNode from '@lblod/ember-rdfa-editor/core/model/nodes/model-node';
import XmlNodeWriter from '@lblod/ember-rdfa-editor/core/model/writers/xml-node-writer';
import { SimplePosition } from '@lblod/ember-rdfa-editor/core/model/simple-position';

export interface XmlWriterConfig {
  showPositions?: boolean;
  showTextNodeLength?: boolean;
  showMarks?: boolean;
}

export type XmlWriterContext = XmlWriterConfig & {
  currentPos: SimplePosition;
};
export default class XmlWriter implements Writer<ModelNode, Node> {
  private config: XmlWriterConfig;

  constructor({
    showPositions = true,
    showMarks = true,
    showTextNodeLength = true,
  }: XmlWriterConfig = {}) {
    this.config = { showMarks, showPositions, showTextNodeLength };
  }

  write(modelNode: ModelNode): Node {
    const document = new Document();
    const context: XmlWriterContext = { ...this.config, currentPos: -1 };
    const writer = new XmlNodeWriter(document);

    return writer.write(modelNode, context);
  }
}
