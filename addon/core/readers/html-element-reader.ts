import Reader from "@lblod/ember-rdfa-editor/core/readers/reader";
import ModelElement, {ElementType} from "@lblod/ember-rdfa-editor/core/model/model-element";
import {tagName} from "@lblod/ember-rdfa-editor/archive/utils/dom-helpers";
import {HtmlReaderContext} from "@lblod/ember-rdfa-editor/core/readers/html-reader";
import HtmlNodeReader from "@lblod/ember-rdfa-editor/core/readers/html-node-reader";
import {copyAttributes} from "@lblod/ember-rdfa-editor/core/readers/reader-utils";

export default class HtmlElementReader implements Reader<HTMLElement, ModelElement[], HtmlReaderContext> {

  read(from: HTMLElement, context: HtmlReaderContext): ModelElement[] {
    const result = new ModelElement(tagName(from) as ElementType);
    copyAttributes(from, result);
    result.updateRdfaPrefixes(context.rdfaPrefixes);
    context.onElementOpen(result);

    const nodeReader = new HtmlNodeReader();
    for (const child of from.childNodes) {
      const parsedChildren = nodeReader.read(child, context);
      result.appendChildren(...parsedChildren);
    }
    context.bindNode(result, from);
    context.onElementClose();
    return [result];
  }

}
