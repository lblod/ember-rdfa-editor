import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import { XmlWriterContext } from '@lblod/ember-rdfa-editor/core/model/writers/xml-writer';

export default class XmlTextWriter {
  constructor(private document: XMLDocument) {}

  write(text: ModelText, context: XmlWriterContext): Element {
    const result = this.document.createElement('text');
    const content = this.document.createTextNode(text.content);
    result.appendChild(content);

    for (const [key, value] of text.attributeMap.entries()) {
      result.setAttribute(key, value);
    }
    if (context.showMarks) {
      if (text.marks.size) {
        const markNames = [];
        for (const mark of text.marks) {
          markNames.push(mark.name);
        }
        result.setAttribute('__marks', markNames.join(','));
      }
    }
    if (context.showTextNodeLength) {
      result.setAttribute('__len', content.length.toString(10));
    }

    return result;
  }
}
