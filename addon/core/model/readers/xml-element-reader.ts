import Reader from '@lblod/ember-rdfa-editor/core/model/readers/reader';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import XmlNodeReader from '@lblod/ember-rdfa-editor/core/model/readers/xml-node-reader';
import { XmlNodeRegistry } from '@lblod/ember-rdfa-editor/core/model/readers/xml-reader';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';

export default class XmlElementReader
  implements Reader<Element, ModelElement, void>
{
  constructor(
    private elementRegistry: XmlNodeRegistry<ModelElement>,
    private textRegistry: XmlNodeRegistry<ModelText>
  ) {}

  read(from: Element): ModelElement {
    let rslt;
    if (from.tagName === 'modelRoot') {
      rslt = new ModelElement('div');
      rslt.setAttribute('contenteditable', '');
      rslt.setAttribute('class', 'say-editor_inner say_content');
    } else {
      rslt = new ModelElement(from.tagName as keyof HTMLElementTagNameMap);
    }
    const nodeReader = new XmlNodeReader(
      this.elementRegistry,
      this.textRegistry
    );
    for (const attribute of from.attributes) {
      if (attribute.name === '__id') {
        this.elementRegistry[attribute.value] = rslt;
      }
      rslt.setAttribute(attribute.name, attribute.value);
    }
    for (const childNode of from.childNodes) {
      const child = nodeReader.read(childNode);
      if (child) {
        rslt.addChild(child);
      }
    }
    return rslt;
  }
}
