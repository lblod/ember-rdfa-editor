import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelElement, {ElementType} from "@lblod/ember-rdfa-editor/model/model-element";
import {isElement, tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {HtmlReaderContext} from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import HtmlNodeReader from "@lblod/ember-rdfa-editor/model/readers/html-node-reader";
import {addChildOrFragment, copyAttributes} from "@lblod/ember-rdfa-editor/model/readers/reader-utils";

/**
 * Reader for an <ul> or <ol> element.
 * NOTE: currently enforces the permitted content constraints very aggressively by ignoring any
 * children which are not <li> elements.
 */
export default class HtmlListReader implements Reader<HTMLUListElement | HTMLOListElement, ModelElement | null, HtmlReaderContext> {
  read(from: HTMLUListElement | HTMLOListElement, context: HtmlReaderContext) {
    const wrapper = new ModelElement(tagName(from) as ElementType);
    const nodeReader = new HtmlNodeReader();
    for (const child of from.childNodes) {
      // non-li childnodes are not allowed
      if(isElement(child) && tagName(child) === "li") {
        const modelChild = nodeReader.read(child, context);
        if(modelChild) {
          addChildOrFragment(wrapper, modelChild);
        }
      }
    }
    // empty lists are useless
    if(!wrapper.length) {
      return null;
    }
    copyAttributes(from, wrapper);
    context.bindNode(wrapper, from);
    return wrapper;
  }

}
