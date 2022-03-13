import Model from '@lblod/ember-rdfa-editor/model/model';
import HtmlTextWriter from '@lblod/ember-rdfa-editor/model/writers/html-text-writer';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { ModelError, WriterError } from '@lblod/ember-rdfa-editor/utils/errors';
import HtmlElementWriter from '@lblod/ember-rdfa-editor/model/writers/html-element-writer';

export type TextOrElement = Text | HTMLElement;

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

  write(modelNode: ModelNode): Node {
    let boundNode: TextOrElement = modelNode.viewRoot as TextOrElement;

    if (!boundNode) {
      if (!modelNode.parent?.viewRoot) {
        throw new ModelError('Impossible state');
      }
      boundNode = this.parseTree(modelNode);
      this.model.registerNodeView(modelNode, boundNode);
      modelNode.clearDirty();
      return boundNode;
    } else {
      if (ModelNode.isModelElement(modelNode)) {
        let result = boundNode;
        if (modelNode.isDirty('node')) {
          result = this.htmlElementWriter.write(modelNode);
          this.swapElement(boundNode as HTMLElement, result);
          this.model.registerNodeView(modelNode, result);
          boundNode = result;
        }
        const domChildren = modelNode.children.map((child) =>
          this.write(child)
        );

        if (modelNode.isDirty('content')) {
          (boundNode as HTMLElement).replaceChildren(...domChildren);
        }
        modelNode.clearDirty();
        return result;
      } else if (ModelNode.isModelText(modelNode)) {
        let result = boundNode;
        if (modelNode.isDirty('node') || modelNode.isDirty('mark')) {
          const domNode = this.htmlTextWriter.write(modelNode) as Text;
          (boundNode as Text).replaceWith(domNode);
          this.model.registerNodeView(modelNode, domNode);
          result = domNode;
        } else if (modelNode.isDirty('content')) {
          (boundNode as Text).replaceData(
            0,
            (boundNode as Text).length,
            modelNode.content
          );
        }
        modelNode.clearDirty();
        return result;
      } else {
        throw new ModelError('Unsupported node type');
      }
    }
  }

  parseTree(modelNode: ModelNode): TextOrElement {
    if (ModelNode.isModelElement(modelNode)) {
      const result = this.htmlElementWriter.write(modelNode);
      for (const child of modelNode.children) {
        result.appendChild(this.parseTree(child));
      }
      return result;
    } else if (ModelNode.isModelText(modelNode)) {
      return this.htmlTextWriter.write(modelNode) as HTMLElement;
    } else {
      throw new WriterError('Unsupported node type');
    }
  }

  swapElement(node: HTMLElement, replacement: HTMLElement) {
    const children = node.childNodes;
    replacement.append(...children);
    node.replaceWith(replacement);
  }
}
