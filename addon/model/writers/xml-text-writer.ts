import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';

export default class XmlTextWriter implements Writer<ModelText, Element> {
  constructor(private document: XMLDocument) {
  }

  write(text: ModelText): Element {
    const result = this.document.createElement('text');
    const content = this.document.createTextNode(text.content);
    result.appendChild(content);

    for (const [key, value] of text.attributeMap.entries()) {
      result.setAttribute(key, value);
    }
    if (text.marks.size) {
      const markNames = [];
      for (const mark of text.marks) {
        markNames.push(mark.name);
      }
      result.setAttribute('__marks', markNames.join(','));
    }

    return result;
  }
}
