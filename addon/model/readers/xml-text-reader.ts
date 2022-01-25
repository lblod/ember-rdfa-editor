import Reader from '@lblod/ember-rdfa-editor/model/readers/reader';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { XmlNodeRegistry } from '@lblod/ember-rdfa-editor/model/readers/xml-reader';
import { compatTextAttributeMap } from '@lblod/ember-rdfa-editor/model/util/constants';
import { TextAttribute } from '@lblod/ember-rdfa-editor/commands/text-properties/set-property-command';

export default class XmlTextReader implements Reader<Element, ModelText, void> {
  constructor(private registry: XmlNodeRegistry<ModelText>) {}

  read(from: Element): ModelText {
    const rslt = new ModelText(from.textContent || '');
    for (const attribute of from.attributes) {
      if (attribute.name === '__id') {
        this.registry[attribute.value] = rslt;
      } else if (attribute.name === '__marks') {
        const markNames = attribute.value.split(',');
        for (const markName of markNames) {
          const specAttribute = compatTextAttributeMap.get(
            markName as TextAttribute
          );
          if (specAttribute) {
            rslt.addMark(specAttribute.spec, specAttribute.attributes);
          }
        }
      } else {
        rslt.setAttribute(attribute.name, attribute.value);
      }
    }
    return rslt;
  }
}
