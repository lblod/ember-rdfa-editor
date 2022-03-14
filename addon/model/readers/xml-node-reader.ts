import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import Reader from '@lblod/ember-rdfa-editor/model/readers/reader';
import XmlElementReader from '@lblod/ember-rdfa-editor/model/readers/xml-element-reader';
import XmlTextReader from '@lblod/ember-rdfa-editor/model/readers/xml-text-reader';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { XmlNodeRegistry } from '@lblod/ember-rdfa-editor/model/readers/xml-reader';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import XmlTableReader from '@lblod/ember-rdfa-editor/model/readers/xml-table-reader';

export default class XmlNodeReader
  implements Reader<Node, ModelNode | null, null>
{
  private elementReader: XmlElementReader;
  private textReader: XmlTextReader;
  private tableReader: XmlTableReader;

  constructor(
    private elementRegistry: XmlNodeRegistry<ModelElement>,
    private textRegistry: XmlNodeRegistry<ModelText>
  ) {
    this.elementReader = new XmlElementReader(elementRegistry, textRegistry);
    this.textReader = new XmlTextReader(textRegistry);
    this.tableReader = new XmlTableReader(elementRegistry, textRegistry);
  }

  read(from: Node): ModelNode | null {
    let result;
    if (isElement(from)) {
      if (from.tagName === 'text') {
        result = this.textReader.read(from);
      } else if (from.tagName === 'table') {
        result = this.tableReader.read(from as Element);
      } else {
        result = this.elementReader.read(from as Element);
      }
    } else {
      result = null;
    }
    return result;
  }
}
