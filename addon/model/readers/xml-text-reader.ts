import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import {XmlNodeRegistry} from "@lblod/ember-rdfa-editor/model/readers/xml-reader";

export default class XmlTextReader implements Reader<Element, ModelText> {
  constructor(private registry: XmlNodeRegistry<ModelText>) {
  }

  read(from: Element): ModelText {
    const rslt = new ModelText(from.textContent || "");
    for (const attribute of from.attributes) {
      if (attribute.name === "__id") {
        this.registry[attribute.value] = rslt;
      } else {
        rslt.setAttribute(attribute.name, attribute.value);

      }
    }
    return rslt;
  }

}
