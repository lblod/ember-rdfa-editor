import Writer from "@lblod/ember-rdfa-editor/model/writers/writer";
import Model, {RichContainer} from "@lblod/ember-rdfa-editor/model/model";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";
import HtmlTextWriter from "@lblod/ember-rdfa-editor/model/writers/html-text-writer";

export default class HtmlWriter implements Writer<RichContainer, HTMLElement> {
  private htmlTextWriter: HtmlTextWriter;
  constructor(private model: Model) {
    this.htmlTextWriter = new HtmlTextWriter();
  }

  write(richElement: RichContainer): HTMLElement {
    if (richElement instanceof RichTextContainer) {
      const span = document.createElement("span");
      for (const child of richElement.children) {
        span.appendChild(this.htmlTextWriter.write(child));
      }
      this.model.bindRichElement(richElement, span);
      return span;
    } else {
      const el = document.createElement(richElement.type);
      for (const child of richElement.children) {
        el.appendChild(this.write(child));
      }
      this.model.bindRichElement(richElement, el);
      return el;
    }
  }

}
