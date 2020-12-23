import Writer from "@lblod/ember-rdfa-editor/model/writers/writer";
import RichText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/rich-text";

export default class HtmlTextWriter implements Writer<RichText, HTMLElement | Node> {

  static attributeMap: Map<TextAttribute, keyof HTMLElementTagNameMap> = new Map<TextAttribute, keyof HTMLElementTagNameMap>(
    [["bold", "strong" ], ["italic", "em"]]
  )
  write(richElement: RichText): HTMLElement | Node {
    let wrapper = document.createElement("span");
    const top = wrapper;
    for(const [key, value] of richElement.attributes.entries()) {
      if(value && HtmlTextWriter.attributeMap.has(key)) {
        const wrapped = document.createElement(HtmlTextWriter.attributeMap.get(key)!);
        wrapper.appendChild(wrapped);
        wrapper = wrapped;
      }
    }
    wrapper.appendChild(new Text(richElement.content));
    return top.firstChild!;
  }
}
