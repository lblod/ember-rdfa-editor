import Model from '@lblod/ember-rdfa-editor/model/model';
import HtmlTextWriter from '@lblod/ember-rdfa-editor/model/writers/html-text-writer';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { WriterError } from '@lblod/ember-rdfa-editor/utils/errors';
import HtmlElementWriter from '@lblod/ember-rdfa-editor/model/writers/html-element-writer';

/**
 * Top-level {@link Writer} for HTML documents.
 */
export default class HtmlWriter {
  private htmlTextWriter: HtmlTextWriter;
  private htmlElementWriter: HtmlElementWriter;

  constructor(private model: Model) {
    this.htmlTextWriter = new HtmlTextWriter(model);
    this.htmlElementWriter = new HtmlElementWriter(model);
  }

  write(modelNode: ModelNode) {
    const boundNode = modelNode.boundNode;
    if (boundNode) {
      if (ModelNode.isModelElement(modelNode)) {
        if (modelNode.isDirty('node')) {
          const domNode = this.htmlElementWriter.write(modelNode);
          (boundNode as HTMLElement).replaceWith(domNode);
        }
        if (modelNode.isDirty('content')) {
          const childNodes = [];

          for (const child of modelNode.children) {
            childNodes.push(this.getDomnodeFor(child));
          }
          boundNode.childNodes.forEach((child) => {
            child.remove();
          });
          childNodes.forEach((child) => boundNode.appendChild(child));
        }
      } else if (ModelNode.isModelText(modelNode)) {
        if (modelNode.isDirty('node')) {
          const domNode = this.htmlTextWriter.write(modelNode);
          (boundNode as Text).replaceWith(domNode);
          this.model.bindNode(modelNode, domNode);
        } else if (modelNode.isDirty('content')) {
          (boundNode as Text).replaceData(
            0,
            (boundNode as Text).length,
            modelNode.content
          );
        }
      }
    } else {
      const domNode = this.getDomnodeFor(modelNode);
      this.model.bindNode(modelNode, domNode);
    }
  }

  getDomnodeFor(modelNode: ModelNode): Node {
    if (ModelNode.isModelElement(modelNode)) {
      return this.htmlElementWriter.write(modelNode);
    } else if (ModelNode.isModelText(modelNode)) {
      return this.htmlTextWriter.write(modelNode);
    } else {
      throw new WriterError('Unsupported node type');
    }
  }
}
