import Reader from "@lblod/ember-rdfa-editor/model/reader";
import RichElement, {RichElementType} from "@lblod/ember-rdfa-editor/model/rich-element";
import {isElement, isTextNode} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";

export default class SimpleReader implements Reader {
  read(node: Node): RichElement | null {
    if(isElement(node)) {
      return new RichElement(node.tagName.toLowerCase() as RichElementType);
    } else if(isTextNode(node)) {
      const richEl = new RichElement("span");
      richEl.text = node.textContent || "";
      return richEl;
    } else if(node.nodeType === Node.COMMENT_NODE) {
      return null;
    } else {
      throw new NotImplementedError();
    }

  }
}
