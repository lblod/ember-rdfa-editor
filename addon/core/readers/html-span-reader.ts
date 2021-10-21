import Reader from "@lblod/ember-rdfa-editor/core/readers/reader";
import {HtmlReaderContext} from "@lblod/ember-rdfa-editor/core/readers/html-reader";
import HtmlElementReader from "@lblod/ember-rdfa-editor/core/readers/html-element-reader";
import HtmlNodeReader from "@lblod/ember-rdfa-editor/core/readers/html-node-reader";
import {HIGHLIGHT_ATTRIBUTE} from "@lblod/ember-rdfa-editor/util/constants";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import {pushOrExpand} from "@lblod/ember-rdfa-editor/util/array-utils";

export default class HtmlSpanReader implements Reader<HTMLSpanElement, ModelNode[], HtmlReaderContext> {
  read(from: HTMLSpanElement, context: HtmlReaderContext): ModelNode[] {
    if (from.getAttribute(HIGHLIGHT_ATTRIBUTE)) {
      const nodeReader = new HtmlNodeReader();
      const wrapper: ModelNode[] = [];
      context.textAttributes.set("highlighted", "true");
      for (const child of from.childNodes) {
        const modelChild = nodeReader.read(child, context);
        if (modelChild) {
          pushOrExpand(wrapper, modelChild);
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
