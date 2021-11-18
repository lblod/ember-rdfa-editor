import Writer from "@lblod/ember-rdfa-editor/model/writers/writer";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import Model from "@lblod/ember-rdfa-editor/model/model";
import HtmlTextWriter from "@lblod/ember-rdfa-editor/model/writers/html-text-writer";
import {WriterError} from "@lblod/ember-rdfa-editor/utils/errors";
import UnpollutedHtmlElementWriter from "./unpolluted-html-element-writer";
import UnpollutedHtmlTextWriter from "./unpolluted-html-text-writer";

export default class HTMLExportWriter implements Writer<ModelNode, Node> {
  private htmlTextWriter: HtmlTextWriter;
  private htmlElementWriter: UnpollutedHtmlElementWriter;

  constructor(private model: Model) {
    this.htmlTextWriter = new UnpollutedHtmlTextWriter(model);
    this.htmlElementWriter = new UnpollutedHtmlElementWriter(model);
  }

  write(modelNode: ModelNode): Node {
    let result = null;

    if (ModelNode.isModelElement(modelNode)) {
      modelNode.removeAttribute('contenteditable');
      result = this.htmlElementWriter.write(modelNode);
      for (const child of modelNode.children) {
        result.appendChild(this.write(child));
      }
    } else if (ModelNode.isModelText(modelNode)) {
      result = this.htmlTextWriter.write(modelNode);
    } else {
      throw new WriterError("Unsupported node type");
    }

    if (!result) {
      result = new Text();
    }

    return result;
  }
}
