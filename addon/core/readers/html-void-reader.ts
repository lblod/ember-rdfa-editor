import Reader from "@lblod/ember-rdfa-editor/model/readers/reader";

/**
 * Utility reader that ignores its input and does nothing, effectively filtering out whatever
 * html it receives
 */
export default class HtmlVoidReader implements Reader<Node, null, void> {
  read(): null {
    return null;
  }

}
