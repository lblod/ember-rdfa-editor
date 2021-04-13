import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelElement, {ElementType} from "@lblod/ember-rdfa-editor/model/model-element";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {HtmlReaderContext} from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import HtmlNodeReader from "@lblod/ember-rdfa-editor/model/readers/html-node-reader";
import {addChildOrFragment, copyAttributes} from "@lblod/ember-rdfa-editor/model/readers/reader-utils";

export default class HtmlElementReader implements Reader<HTMLElement, ModelElement, HtmlReaderContext> {

  read(from: HTMLElement, context: HtmlReaderContext): ModelElement {
    const result = new ModelElement(tagName(from) as ElementType);
    copyAttributes(from, result);

    const nodeReader = new HtmlNodeReader();
    for (const child of from.childNodes) {
      const modelChild = nodeReader.read(child, context);
      if(modelChild) {
        addChildOrFragment(result, modelChild);
      }
    }
    context.bindNode(result, from);
    return result;
  }

}
