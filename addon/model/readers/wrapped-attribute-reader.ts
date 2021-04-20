import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import {tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import Fragment from "@lblod/ember-rdfa-editor/model/fragment";
import {HtmlTag} from "@lblod/ember-rdfa-editor/model/util/types";
import {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "../model-element";
import {HtmlReaderContext} from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import HtmlNodeReader from "@lblod/ember-rdfa-editor/model/readers/html-node-reader";
import {addChildOrFragment} from "@lblod/ember-rdfa-editor/model/readers/reader-utils";


/**
 * Reader responsible for reading HTML elements which we want to translate into text styles.
 */
export default class WrappedAttributeReader implements Reader<HTMLElement, Fragment | ModelElement, HtmlReaderContext> {
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

  read(from: HTMLElement, context: HtmlReaderContext): Fragment | ModelElement  {
    const attribute = WrappedAttributeReader.tagMap.get(tagName(from) as HtmlTag)!;
    const nodeReader = new HtmlNodeReader();
    const wrapper = new Fragment();
    context.textAttributes.set(attribute, "true");
    for(const child of from.childNodes) {
      const modelChild = nodeReader.read(child, context);
      if(modelChild) {
        addChildOrFragment(wrapper, modelChild);
      }
    }
    context.textAttributes.delete(attribute);
    return wrapper;
  }

}
