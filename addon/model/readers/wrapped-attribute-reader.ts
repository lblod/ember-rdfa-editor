import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import {TextAttribute} from "@lblod/ember-rdfa-editor/model/rich-text";
import {tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import Fragment from "@lblod/ember-rdfa-editor/model/fragment";
import {HtmlTag} from "@lblod/ember-rdfa-editor/model/util/types";


/**
 * Reader responsible for reading HTML elements which we want to translate into text styles.
 */
export default class WrappedAttributeReader implements Reader<HTMLElement, Fragment> {
  static tagMap: Map<HtmlTag, TextAttribute> = new Map<HtmlTag, TextAttribute>(
    [
      ["strong", "bold"],
      ["b", "bold"],
      ["i", "italic"],
      ["em", "italic"],
    ]
  )


  read(from: HTMLElement): Fragment {

    const result = new Fragment();
    const attribute = WrappedAttributeReader.tagMap.get(tagName(from) as HtmlTag)!;
    result.setTextAttribute(attribute, true);
    return result;
  }

}
