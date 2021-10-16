import Reader from "@lblod/ember-rdfa-editor/core/readers/reader";
import ModelText from "@lblod/ember-rdfa-editor/core/model/model-text";
import {HtmlReaderContext} from "@lblod/ember-rdfa-editor/core/readers/html-reader";
import MapUtils from "@lblod/ember-rdfa-editor/util/map-utils"

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
    context.onText(result);
    return [result];
  }
}
