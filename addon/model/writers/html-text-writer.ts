import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import Handlebars from 'handlebars';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelText, {
  TextAttribute,
} from '@lblod/ember-rdfa-editor/model/model-text';
import { hbs } from 'ember-cli-htmlbars';
import HTMLInputParser from '@lblod/ember-rdfa-editor/utils/html-input-parser';

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class HtmlTextWriter implements Writer<ModelText, Node | null> {
  static attributeMap: Map<TextAttribute, keyof HTMLElementTagNameMap> =
    new Map<TextAttribute, keyof HTMLElementTagNameMap>([
      ['bold', 'strong'],
      ['italic', 'em'],
      ['underline', 'u'],
      ['strikethrough', 'del'],
      ['highlighted', 'span'],
    ]);

  constructor(protected model: Model) {}

  get attributeMap() {
    return HtmlTextWriter.attributeMap;
  }

  write(modelNode: ModelText): Node | null {
    if (modelNode.length === 0) {
      return null;
    }

    const result = new Text(modelNode.content);
    this.model.bindNode(modelNode, result);

    // for (const entry of modelNode.getTextAttributes()) {
    //   const attributeMapping = HtmlTextWriter.attributeMap.get(entry[0]);
    //   if (entry[1] && attributeMapping) {
    //     const wrappingElement = document.createElement(attributeMapping);
    //     if (entry[0] === 'highlighted') {
    //       wrappingElement.setAttribute('data-editor-highlight', 'true');
    //     }
    //     wrapper.appendChild(wrappingElement);
    //     wrapper = wrappingElement;
    //   }
    // }
    let current = modelNode.content;
    for (const entry of [...modelNode.marks].sort((a, b) =>
      a.priority >= b.priority ? 1 : -1
    )) {
      const wrappingElement = entry.write(Handlebars.compile)({
        children: current,
      });
      current = wrappingElement;
    }

    const parser = new DOMParser();
    return parser.parseFromString(current, 'text/html').body.firstChild!;
  }
}
