import Model from '@lblod/ember-rdfa-editor/model/model';
import HtmlTextWriter from '@lblod/ember-rdfa-editor/model/writers/html-text-writer';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import {
  ModelError,
  NotImplementedError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import HtmlElementWriter from '@lblod/ember-rdfa-editor/model/writers/html-element-writer';
import NodeView, {
  ElementView,
  isElementView,
  isTextView,
  TextView,
} from '@lblod/ember-rdfa-editor/model/node-view';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import HtmlInlineComponentWriter from './html-inline-component-writer';

/**
 * Top-level {@link Writer} for HTML documents.
 */
export default class HtmlWriter {
  private htmlTextWriter: HtmlTextWriter;
  private htmlElementWriter: HtmlElementWriter;
  private htmlInlineComponentWriter: HtmlInlineComponentWriter;

  constructor(private model: Model) {
    this.htmlTextWriter = new HtmlTextWriter(model);
    this.htmlElementWriter = new HtmlElementWriter(model);
    this.htmlInlineComponentWriter = new HtmlInlineComponentWriter();
  }

  write(modelNode: ModelNode): NodeView {
    let resultView: NodeView;
    if (ModelNode.isModelElement(modelNode)) {
      let view = this.getView(modelNode);
      if (view) {
        if (!isElementView(view)) {
          throw new ModelError('ModelElement with non-element view');
        }
        view = this.updateElementView(modelNode, view);
      } else {
        view = this.createElementView(modelNode);
      }
      const childViews = [];
      for (const child of modelNode.children) {
        childViews.push(this.write(child));
      }
      if (modelNode.isDirty('content')) {
        if (isElement(view.viewRoot)) {
          view.viewRoot.replaceChildren(
            ...childViews.map((view) => view.viewRoot)
          );
        } else {
          throw new ModelError('Model element with non-element viewroot');
        }
      }
      resultView = view;
    } else if (ModelNode.isModelText(modelNode)) {
      let view = this.getView(modelNode);
      if (view) {
        if (!isTextView(view)) {
          throw new ModelError('ModelText with non-text view');
        }
        view = this.updateTextView(modelNode, view);
      } else {
        view = this.createTextView(modelNode);
      }
      resultView = view;
    } else if (ModelNode.isModelInlineComponent(modelNode)) {
      let child: NodeView | undefined;
      if (modelNode.children.length) {
        child = this.write(modelNode.children[0]);
      }
      resultView = this.htmlInlineComponentWriter.write(
        modelNode,
        child?.viewRoot
      );
      this.model.registerNodeView(modelNode, resultView);
    } else {
      throw new NotImplementedError('Unsupported modelnode type');
    }
    modelNode.clearDirty();
    return resultView;
  }

  private getView(modelNode: ModelNode) {
    return this.model.modelToView(modelNode);
  }

  private createElementView(modelElement: ModelElement): ElementView {
    const view = this.htmlElementWriter.write(modelElement);
    this.model.registerNodeView(modelElement, view);
    return view;
  }

  private updateElementView(
    modelElement: ModelElement,
    view: ElementView
  ): NodeView {
    if (modelElement.isDirty('node')) {
      const newView = this.createElementView(modelElement);
      this.swapElement(view.viewRoot, newView.viewRoot);
      return newView;
    }
    return view;
  }

  private createTextView(modelText: ModelText): NodeView {
    const view = this.htmlTextWriter.write(modelText);
    this.model.registerNodeView(modelText, view);
    return view;
  }

  private updateTextView(modelText: ModelText, view: TextView): NodeView {
    if (modelText.isDirty('node') || modelText.isDirty('mark')) {
      const newView = this.createTextView(modelText);
      view.viewRoot.replaceWith(newView.viewRoot);
      return newView;
    } else if (modelText.isDirty('content')) {
      view.contentRoot.replaceData(
        0,
        view.contentRoot.length,
        modelText.content
      );
    }
    return view;
  }

  swapElement(node: HTMLElement, replacement: HTMLElement) {
    const children = node.childNodes;
    replacement.append(...children);
    node.replaceWith(replacement);
  }
}
