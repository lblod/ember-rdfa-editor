import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {invisibleSpace} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

/**
 * Reader for the <br> element
 * TODO: currently not used
 */
export default class HtmlBreakReader implements Reader<HTMLElement, ModelElement> {
  read(_: HTMLElement): ModelElement {
    const paragraph = new ModelElement("p");
    const text = new ModelText(invisibleSpace);
    paragraph.addChild(text);
    return paragraph;
  }

}
