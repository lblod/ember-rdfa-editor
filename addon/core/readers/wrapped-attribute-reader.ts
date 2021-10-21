import Reader from "@lblod/ember-rdfa-editor/core/readers/reader";
import {HtmlTag} from "@lblod/ember-rdfa-editor/util/types";
import {TextAttribute} from "@lblod/ember-rdfa-editor/core/model/model-text";
import {HtmlReaderContext} from "@lblod/ember-rdfa-editor/core/readers/html-reader";
import HtmlNodeReader from "@lblod/ember-rdfa-editor/core/readers/html-node-reader";
import {KeyError} from "@lblod/ember-rdfa-editor/util/errors";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import {pushOrExpand} from "@lblod/ember-rdfa-editor/util/array-utils";
import { tagName } from "@lblod/ember-rdfa-editor/util/dom-helpers";


/**
 * Reader responsible for reading HTML elements which we want to translate into text text-styles.
 */
export default class WrappedAttributeReader implements Reader<HTMLElement, ModelNode[] , HtmlReaderContext> {
  static tagMap: Map<HtmlTag, TextAttribute> = new Map<HtmlTag, TextAttribute>(
    [
      ["strong", "bold"],
      ["b", "bold"],
      ["i", "italic"],
      ["em", "italic"],
      ["u", "underline"],
      ["del", "strikethrough"],
    ]
  );

  read(from: HTMLElement, context: HtmlReaderContext): ModelNode[]  {
    const attribute = WrappedAttributeReader.tagMap.get(tagName(from) as HtmlTag);
    if(!attribute) {
      throw new KeyError(tagName(from));
    }
    const nodeReader = new HtmlNodeReader();
    context.textAttributes.set(attribute, "true");
    const result: ModelNode[] = [];
    for(const child of from.childNodes) {
      const modelChild = nodeReader.read(child, context);
      if(modelChild) {
        pushOrExpand(result, modelChild);
      }
    }
    context.textAttributes.delete(attribute);
    return result;
  }

}
