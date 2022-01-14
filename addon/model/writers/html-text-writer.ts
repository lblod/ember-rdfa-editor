import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import Handlebars from 'handlebars';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelText, {TextAttribute,} from '@lblod/ember-rdfa-editor/model/model-text';
import {isElement, isTextNode,} from '@lblod/ember-rdfa-editor/utils/dom-helpers';

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
    let current = modelNode.content || '';
    for (const entry of [...modelNode.marks].sort((a, b) =>
      a.priority >= b.priority ? 1 : -1
    )) {
      const wrappingElement = entry.write(Handlebars.compile)({
        children: current,
      });
      current = wrappingElement;
    }

    const parser = new DOMParser();
    const parseResult = parser.parseFromString(current, 'text/html').body
      .firstChild!;
    if (parseResult) {
      if (isTextNode(parseResult)) {
        this.model.bindNode(modelNode, parseResult);
      } else if (isElement(parseResult)) {
        this.model.bindNode(modelNode, this.firstLeafNode(parseResult));
      }
      return parseResult;
    } else {
      const result = new Text();
      this.model.bindNode(modelNode, result);
      return result;
    }
  }

  firstLeafNode(node: Element) {
    let current: Node = node;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }
}
