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
import HtmlAdjacentTextWriter from './html-adjacent-text-writer';
import { TextOrElement } from '../util/types';
import ArrayUtils from '../util/array-utils';

/**
 * Top-level {@link Writer} for HTML documents.
 */
export default class HtmlWriter {
  private htmlTextWriter: HtmlTextWriter;
  private htmlAdjacentTextWriter: HtmlAdjacentTextWriter;
  private htmlElementWriter: HtmlElementWriter;

  constructor(private model: Model) {
    this.htmlTextWriter = new HtmlTextWriter(model);
    this.htmlAdjacentTextWriter = new HtmlAdjacentTextWriter(model);
    this.htmlElementWriter = new HtmlElementWriter(model);
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
      let adjacentTextNodes: ModelText[] = [];

      for (const child of modelNode.children) {
        if (ModelNode.isModelText(child)) {
          adjacentTextNodes.push(child);
        } else {
          if (adjacentTextNodes.length > 0) {
            // process adjacent text nodes
            childViews.push(...this.processTextViews(adjacentTextNodes));
            adjacentTextNodes = [];
          }
          childViews.push(this.write(child).viewRoot);
        }
      }
      if (adjacentTextNodes.length > 0) {
        childViews.push(...this.processTextViews(adjacentTextNodes));
      }
      if (modelNode.isDirty('content')) {
        if (isElement(view.viewRoot)) {
          view.viewRoot.replaceChildren(...childViews);
        } else {
          throw new ModelError('Model element with non-element viewroot');
        }
      }
      resultView = view;
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

  private processTextViews(modelTexts: ModelText[]): Set<Node> {
    const result: Set<Node> = new Set();
    if (
      modelTexts.some(
        (modelText) =>
          modelText.isDirty('node') ||
          modelText.isDirty('mark') ||
          !this.getView(modelText)
      )
    ) {
      const textViews = this.htmlAdjacentTextWriter.write(modelTexts);
      modelTexts.forEach((modelText, i) => {
        const view = this.getView(modelText);
        if (view) {
          view.viewRoot = textViews[i].viewRoot;
          if (modelText.isDirty('content')) {
            view.contentRoot = textViews[i].contentRoot;
          }
          result.add(view.viewRoot);
        } else {
          this.model.registerNodeView(modelText, textViews[i]);
          result.add(textViews[i].viewRoot);
        }
      });
      //apply html-adjacent-text-writer
    } else {
      modelTexts.forEach((modelText) => {
        if (modelText.isDirty('content')) {
          const view = this.getView(modelText);
          if (view) {
            if (!isTextView(view)) {
              throw new ModelError('ModelText with non-text view');
            }
            view.contentRoot.replaceData(
              0,
              view.contentRoot.length,
              modelText.content
            );
            result.add(view.viewRoot);
          }
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
