import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import Fragment from "@lblod/ember-rdfa-editor/model/fragment";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

/**
 * Reader for the <br> element
 * TODO: currently not used
 */
export default class HtmlBreakReader implements Reader<HTMLElement, Fragment> {
  read(_: HTMLElement): Fragment {
    const fragment = new Fragment();
    const text = new ModelText("\n");
    fragment.addChild(text);
    return fragment;
  }

}
