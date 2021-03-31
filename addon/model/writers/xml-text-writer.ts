import Writer from "@lblod/ember-rdfa-editor/model/writers/writer";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

export default class XmlTextWriter implements Writer<ModelText, Element> {

  constructor(private document: XMLDocument) {
  }

  write(text: ModelText): Element {
    const rslt = this.document.createElement("text");
    const content = this.document.createTextNode(text.content);
    rslt.appendChild(content);
    for (const [key, value] of text.attributeMap.entries()) {
      rslt.setAttribute(key, value);
    }
    return rslt;
  }

}
