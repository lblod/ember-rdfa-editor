import Writer from "@lblod/ember-rdfa-editor/core/writers/writer";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import HtmlTextWriter from "@lblod/ember-rdfa-editor/core/writers/html-text-writer";
import {WriterError} from "@lblod/ember-rdfa-editor/util/errors";
import UnpollutedHtmlElementWriter from "./unpolluted-html-element-writer";
import UnpollutedHtmlTextWriter from "./unpolluted-html-text-writer";
import EditorModel from "@lblod/ember-rdfa-editor/core/editor-model";

export default class HTMLExportWriter implements Writer<ModelNode, Node> {
  private htmlTextWriter: HtmlTextWriter;
  private htmlElementWriter: UnpollutedHtmlElementWriter;

  constructor(private model: EditorModel) {
    this.htmlTextWriter = new UnpollutedHtmlTextWriter(model);
    this.htmlElementWriter = new UnpollutedHtmlElementWriter(model);
  }

  write(modelNode: ModelNode): Node {
    let result = null;

    if (ModelNode.isModelElement(modelNode)) {
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
