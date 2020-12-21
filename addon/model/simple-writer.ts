import Writer from "@lblod/ember-rdfa-editor/model/writer";
import RichElement from "@lblod/ember-rdfa-editor/model/rich-element";

export default class SimpleWriter implements Writer {
  write(richElement: RichElement): HTMLElement {
    const el = document.createElement(richElement.type);
    if (richElement.text) {

      let baseTextNode = new Text(richElement.text);
      const children: Node[] = [baseTextNode];

      for (const boldRange of richElement.bold.ranges) {
        const boldNode = baseTextNode.splitText(boldRange[0]);
        const rest = boldNode.splitText(boldRange[1] - boldRange[0]);
        const strong = document.createElement("strong");
        strong.appendChild(boldNode);
        children.push(strong);
        children.push(rest);
        baseTextNode = rest;

      }
      el.append(...children);
    }
    return el;
  }
}
