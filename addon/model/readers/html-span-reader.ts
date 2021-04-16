import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import Fragment from "@lblod/ember-rdfa-editor/model/fragment";
import {HtmlReaderContext} from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import HtmlElementReader from "@lblod/ember-rdfa-editor/model/readers/html-element-reader";
import HtmlNodeReader from "@lblod/ember-rdfa-editor/model/readers/html-node-reader";
import {addChildOrFragment} from "@lblod/ember-rdfa-editor/model/readers/reader-utils";
import {HIGHLIGHT_ATTRIBUTE} from "@lblod/ember-rdfa-editor/model/util/constants";

export default class HtmlSpanReader implements Reader<HTMLSpanElement, Fragment | ModelElement, HtmlReaderContext> {
  read(from: HTMLSpanElement, context: HtmlReaderContext): Fragment | ModelElement {
    if (from.getAttribute(HIGHLIGHT_ATTRIBUTE)) {
      const nodeReader = new HtmlNodeReader();
      const wrapper = new Fragment();
      context.textAttributes.set("highlighted", "true");
      for (const child of from.childNodes) {
        const modelChild = nodeReader.read(child, context);
        if (modelChild) {
          addChildOrFragment(wrapper, modelChild);
        }
      }
      context.textAttributes.delete("highlighted");
      return wrapper;

    } else {
      const elementReader = new HtmlElementReader();
      return elementReader.read(from, context);
    }
  }

}
