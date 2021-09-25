import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import {HtmlReaderContext} from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import MapUtils from "@lblod/ember-rdfa-editor/model/util/map-utils";

/**
 * Reader responsible for reading HTML Text nodes
 */
export default class HtmlTextReader implements Reader<Text, ModelText[], HtmlReaderContext> {

  read(from: Text, context: HtmlReaderContext): ModelText[] {
    if (!from.textContent || from.textContent === "") {
      return [];
    }
    const result = new ModelText(from.textContent);
    MapUtils.copyMapContents(context.textAttributes, result.attributeMap);
    context.bindNode(result, from);
    return [result];
  }
}
