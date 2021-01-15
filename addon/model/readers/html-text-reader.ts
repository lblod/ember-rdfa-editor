import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import Model from "@lblod/ember-rdfa-editor/model/model";
import {stringToVisibleText} from "@lblod/ember-rdfa-editor/editor/utils";

/**
 * Reader responsible for reading HTML Text nodes
 */
export default class HtmlTextReader implements Reader<Text, ModelText | null> {
  lastTextNode: ModelText | null = null;
  constructor(private model: Model) {
  }

  read(from: Text): ModelText | null {
    if(!from.textContent || from.textContent === "") {
      return null;
    }
    const text = new ModelText(from.textContent || "");
    this.lastTextNode = text;
    return text;
  }
}
