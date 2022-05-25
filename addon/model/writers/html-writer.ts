import State from '@lblod/ember-rdfa-editor/core/state';
import { View } from '@lblod/ember-rdfa-editor/core/view';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import NodeView, {
  ElementView,
  isElementView,
  isTextView,
  TextView,
} from '@lblod/ember-rdfa-editor/model/node-view';
import HtmlElementWriter from '@lblod/ember-rdfa-editor/model/writers/html-element-writer';
import HtmlTextWriter from '@lblod/ember-rdfa-editor/model/writers/html-text-writer';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import {
  ModelError,
  NotImplementedError,
} from '@lblod/ember-rdfa-editor/utils/errors';

/**
 * Top-level {@link Writer} for HTML documents.
 */
export default class HtmlWriter {
  private htmlAdjacentTextWriter: HtmlAdjacentTextWriter;
  private htmlElementWriter: HtmlElementWriter;

  constructor(private model: Model) {
    this.htmlAdjacentTextWriter = new HtmlAdjacentTextWriter(model);
    this.htmlElementWriter = new HtmlElementWriter(model);
  }

  write(state: State, view: View, modelNode: ModelNode): NodeView {
    let resultView: NodeView;

    if (ModelNode.isModelElement(modelNode)) {
      let nodeView = view.modelToView(state, modelNode);
      if (nodeView) {
        if (!isElementView(nodeView)) {
          throw new ModelError('ModelElement with non-element view');
        }
        nodeView = this.updateElementView(view, modelNode, nodeView);
      } else {
        nodeView = this.createElementView(view, modelNode);
      }
      const childViews = [];
      let adjacentTextNodes: ModelText[] = [];

      for (const child of modelNode.children) {
        childViews.push(this.write(state, view, child));
      }
      if (adjacentTextNodes.length > 0) {
        childViews.push(...this.processTextViews(adjacentTextNodes));
        adjacentTextNodes.forEach((textNode) => textNode.clearDirty());
      }

      if (modelNode.isDirty('content')) {
        if (isElement(view.viewRoot)) {
          view.viewRoot.replaceChildren(...childViews);
        } else {
          throw new ModelError('Model element with non-element viewroot');
        }
      }
      resultView = nodeView;
    } else if (ModelNode.isModelText(modelNode)) {
      let nodeView = view.modelToView(state, modelNode);
      if (nodeView) {
        if (!isTextView(nodeView)) {
          throw new ModelError('ModelText with non-text view');
        }
        nodeView = this.updateTextView(view, modelNode, nodeView);
      } else {
        nodeView = this.createTextView(view, modelNode);
      }
      resultView = nodeView;
    } else {
      throw new NotImplementedError('Unsupported modelnode type');
    }
    modelNode.clearDirty();
    return resultView;
  }

  private createElementView(
    view: View,
    modelElement: ModelElement
  ): ElementView {
    const nodeView = this.htmlElementWriter.write(modelElement);
    return nodeView;
  }

  private updateElementView(
    view: View,
    modelElement: ModelElement,
    elementView: ElementView
  ): NodeView {
    if (modelElement.isDirty('node')) {
      const newView = this.createElementView(view, modelElement);
      this.swapElement(elementView.viewRoot, newView.viewRoot);
      return newView;
    }
    return elementView;
  }

  private createTextView(view: View, modelText: ModelText): NodeView {
    const nodeView = this.htmlTextWriter.write(modelText);
    return nodeView;
  }

        if (view) {
          if (!isTextView(view)) {
            throw new ModelError('ModelText with non-text view');
          }
          view.viewRoot.replaceWith(textViews[i].viewRoot);
          this.model.registerTextNode(modelText, textViews[i]);
          result.add(textViews[i].viewRoot);
        } else {
          this.model.registerTextNode(modelText, textViews[i]);
          result.add(textViews[i].viewRoot);
        }
      });
    }

    return result;
  }

  swapElement(node: HTMLElement, replacement: HTMLElement) {
    const children = node.childNodes;
    replacement.append(...children);
    node.replaceWith(replacement);
  }
}
