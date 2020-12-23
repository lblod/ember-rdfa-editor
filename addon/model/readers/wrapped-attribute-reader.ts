import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";
import RichText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/rich-text";
import {isElement} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

export type WrappedAttributeTag = "strong" | "b" | "i";
export type WrappedAttributeElement = HTMLElementTagNameMap[WrappedAttributeTag];


/**
 * Reader responsible for reading HTML elements which we want to translate into text styles.
 */
export default class WrappedAttributeReader implements Reader<HTMLElement, RichTextContainer> {
  static tagMap: Map<WrappedAttributeTag, TextAttribute> = new Map<WrappedAttributeTag, TextAttribute>(
    [
      ["strong", "bold"],
      ["b", "bold"],
      ["i", "italic"],
    ]
  )
  static isWrappedAttributeElement(element: HTMLElement): element is WrappedAttributeElement {
    return WrappedAttributeReader.tagMap.has(element.tagName as WrappedAttributeTag);
  }

  read(from: WrappedAttributeElement): RichTextContainer {
    const container = new RichTextContainer();
    const attribute = WrappedAttributeReader.tagMap.get(from.tagName as WrappedAttributeTag)!;

    from.normalize();

    for (const child of from.childNodes) {
      if (isElement(child) && WrappedAttributeReader.isWrappedAttributeElement(child)) {
        const childcontainer = this.read(child);
        for (const richText of childcontainer.children) {
          richText.setAttribute(attribute, true);
          container.addChild(richText);
        }
      } else {
        // WARNING: any attributes of descendants of the style element are lost.
        // The idea is that we can hopefully enforce that a style element does not contain
        // anything mode than text or other style elements.
        const richText = new RichText(child.textContent || "");
        richText.setAttribute(attribute, true);
        container.addChild(richText);
      }
    }
    return container;
  }
}
