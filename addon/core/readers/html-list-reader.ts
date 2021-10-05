import Reader from "@lblod/ember-rdfa-editor/core/readers/reader";
import ModelElement, {ElementType} from "@lblod/ember-rdfa-editor/core/model/model-element";
import {isElement, tagName} from "@lblod/ember-rdfa-editor/archive/utils/dom-helpers";
import {HtmlReaderContext} from "@lblod/ember-rdfa-editor/core/readers/html-reader";
import HtmlNodeReader from "@lblod/ember-rdfa-editor/core/readers/html-node-reader";
import {copyAttributes} from "@lblod/ember-rdfa-editor/core/readers/reader-utils";

/**
 * Reader for an <ul> or <ol> element.
 * NOTE: currently enforces the permitted content constraints very aggressively by ignoring any
 * children which are not <li> elements.
 */
export default class HtmlListReader implements Reader<HTMLUListElement | HTMLOListElement, ModelElement[], HtmlReaderContext> {
  read(from: HTMLUListElement | HTMLOListElement, context: HtmlReaderContext): ModelElement[] {
    const wrapper = new ModelElement(tagName(from) as ElementType);
    const nodeReader = new HtmlNodeReader();
    for (const child of from.childNodes) {
      // non-li childnodes are not allowed
      if (isElement(child) && tagName(child) === "li") {
        const parsedChildren = nodeReader.read(child, context);
        if (parsedChildren) {
          wrapper.appendChildren(...parsedChildren);
        }
      }
    }
    // empty lists are useless
    if (!wrapper.length) {
      return [];
    }
    copyAttributes(from, wrapper);
    context.bindNode(wrapper, from);
    return [wrapper];
  }

}
