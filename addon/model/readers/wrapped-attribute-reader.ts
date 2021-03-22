import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import {tagName} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import Fragment from "@lblod/ember-rdfa-editor/model/fragment";
import {HtmlTag} from "@lblod/ember-rdfa-editor/model/util/types";
import {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";


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
      ["u", "underline"],
      ["del", "strikethrough"],
      ["span", "highlighted"]
    ]
  )


  read(from: HTMLElement): Fragment {

    const result = new Fragment();
    const attribute = WrappedAttributeReader.tagMap.get(tagName(from) as HtmlTag)!;
    result.setTextAttribute(attribute, true);
    if (attribute === "highlighted" && ! from.getAttribute("data-editor-highlight")) {
      result.setTextAttribute("highlighted", false);
    }
    return result;
  }

}
