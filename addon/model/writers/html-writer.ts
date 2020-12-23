import Writer from "@lblod/ember-rdfa-editor/model/writers/writer";
import Model, {RichContainer} from "@lblod/ember-rdfa-editor/model/model";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";
import HtmlTextWriter from "@lblod/ember-rdfa-editor/model/writers/html-text-writer";

/**
 * Top-level {@link Writer} for HTML documents.
 */
export default class HtmlWriter implements Writer<RichContainer, HTMLElement> {
  private htmlTextWriter: HtmlTextWriter;

  constructor(private model: Model) {
    this.htmlTextWriter = new HtmlTextWriter();
  }

  write(richElement: RichContainer): HTMLElement {
    let result;
    if (richElement instanceof RichTextContainer) {
      const span = document.createElement("span");
      for (const child of richElement.children) {
        span.appendChild(this.htmlTextWriter.write(child));
      }
      this.cloneAttributes(richElement, span);
      this.model.bindRichElement(richElement, span);
      result = span;
    } else {
      const el = document.createElement(richElement.type);
      for (const child of richElement.children) {
        el.appendChild(this.write(child));
      }
      this.cloneAttributes(richElement, el);
      this.model.bindRichElement(richElement, el);
      result = el;
    }

    return result;
  }

  private cloneAttributes(richElement: RichContainer, htmlElement: HTMLElement) {
    if (richElement.htmlAttributes) {
      for (const entry of richElement.htmlAttributes) {
        // It might be better to clone in the reader instead, but this works
        htmlElement.attributes.setNamedItem(entry.cloneNode() as Attr);
      }
    }

  }

}
