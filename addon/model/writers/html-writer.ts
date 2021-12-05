import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import Model from '@lblod/ember-rdfa-editor/model/model';
import HtmlTextWriter from '@lblod/ember-rdfa-editor/model/writers/html-text-writer';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { WriterError } from '@lblod/ember-rdfa-editor/utils/errors';
import HtmlElementWriter from '@lblod/ember-rdfa-editor/model/writers/html-element-writer';

/**
 * Top-level {@link Writer} for HTML documents.
 */
export default class HtmlWriter implements Writer<ModelNode, Node> {
  private htmlTextWriter: HtmlTextWriter;
  private htmlElementWriter: HtmlElementWriter;

  constructor(private model: Model) {
    this.htmlTextWriter = new HtmlTextWriter(model);
    this.htmlElementWriter = new HtmlElementWriter(model);
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
      throw new WriterError('Unsupported node type');
    }

    if (!result) {
      result = new Text();
      this.model.bindNode(modelNode, result);
    }

    return result;
  }
}
