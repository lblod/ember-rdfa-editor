import State from '@lblod/ember-rdfa-editor/core/state';
import { View } from '@lblod/ember-rdfa-editor/core/view';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import HtmlElementWriter from '@lblod/ember-rdfa-editor/model/writers/html-element-writer';
import HtmlTextWriter from '@lblod/ember-rdfa-editor/model/writers/html-text-writer';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/errors';
import { LUMP_NODE_PROPERTY } from '../util/constants';
import { isTextOrElement, TextOrElement } from '../util/types';
type Difference = 'type' | 'tag' | 'attrs' | 'content' | 'none';

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

  write(state: State, view: View) {
    const domRoot = view.domRoot;
    const modelRoot = state.document;
    if (modelRoot.children.length !== domRoot.childNodes.length) {
      const parsedChildren = modelRoot.children.map((child) =>
        this.parseSubTree(child)
      );
      domRoot.replaceChildren(...parsedChildren);
    } else {
      modelRoot.children.forEach((child, index) => {
        this.writeRec(child, domRoot.childNodes[index]);
      });
    }
  }
  private writeRec(modelNode: ModelNode, domNode: Node) {
    const parsedNode = this.parseNode(modelNode);
    const diff = this.compareNodes(parsedNode, domNode);
    switch (diff) {
      case 'type':
        (domNode as HTMLElement | Text).replaceWith(
          this.parseSubTree(modelNode)
        );
        break;
      case 'tag':
        (domNode as HTMLElement | Text).replaceWith(
          this.parseSubTree(modelNode)
        );
        break;
      case 'attrs':
        this.swapElement(domNode as HTMLElement, parsedNode as HTMLElement);
        break;
      case 'content':
        (domNode as HTMLElement | Text).replaceWith(
          this.parseSubTree(modelNode)
        );
        break;
      case 'none':
        if (ModelNode.isModelElement(modelNode)) {
          modelNode.children.forEach((child, index) => {
            this.writeRec(child, domNode.childNodes[index]);
          });
        }
        break;
    }
  }
  private compareNodes(parsedNode: Node, domNode: Node): Difference {
    if (parsedNode.nodeType !== domNode.nodeType) {
      return 'type';
    }
    if (isElement(parsedNode)) {
      if (tagName(parsedNode) !== tagName(domNode)) {
        return 'tag';
      }
      if (parsedNode.childNodes.length !== domNode.childNodes.length) {
        return 'content';
      } else if (
        !this.areDomAttributesSame(parsedNode.attributes, domNode.attributes)
      ) {
        return 'attrs';
      }
    } else if (isTextNode(parsedNode)) {
      if (parsedNode.textContent !== domNode.textContent) {
        return 'content';
      }
    } else {
      throw new NotImplementedError('unsupported node type');
    }
    return 'none';
  }
  private parseNode(modelNode: ModelNode): Node {
    if (ModelNode.isModelElement(modelNode)) {
      return this.parseElement(modelNode);
    } else if (ModelNode.isModelText(modelNode)) {
      return this.parseText(modelNode);
    } else {
      throw new NotImplementedError('Unsupported node type');
    }
  }
  private parseSubTree(modelNode: ModelNode): Node {
    if (modelNode.isLeaf) {
      return this.parseNode(modelNode);
    } else {
      const result = this.parseNode(modelNode) as HTMLElement;
      const parsedChildren = (modelNode as ModelElement).children.map((child) =>
        this.parseSubTree(child)
      );
      result.append(...parsedChildren);
      return result;
    }
  }
  private areDomAttributesSame(
    left: NamedNodeMap,
    right: NamedNodeMap
  ): boolean {
    if (left.length !== right.length) {
      return false;
    }
    for (const leftAttr of left) {
      const rightAttr = right.getNamedItem(leftAttr.name);
      if (!rightAttr || rightAttr.value !== leftAttr.value) {
        return false;
      }
    }
    return true;
  }

  private parseElement(element: ModelElement): HTMLElement {
    const result = document.createElement(element.type);

    // This will disable the selection of multiple cells on table.
    // Idea reverse-engineered from readctor.
    if (element.type === 'table') {
      result.contentEditable = 'false';
    }
    if (element.type === 'td' || element.type === 'th') {
      if (parentIsLumpNode(element)) {
        result.contentEditable = 'false';
      } else {
        result.contentEditable = 'true';
      }
    }

    for (const item of element.attributeMap.entries()) {
      result.setAttribute(item[0], item[1]);
    }
    return result;
  }
<<<<<<< variant A

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
>>>>>>> variant B
  private parseText(text: ModelText): Node {
    const contentRoot: Text = new Text(text.content);
    let current: TextOrElement = contentRoot;

    for (const entry of [...text.marks].sort((a, b) =>
      a.priority >= b.priority ? 1 : -1
    )) {
      const rendered = entry.write(current);
      if (isTextOrElement(rendered)) {
        current = rendered;
      } else {
        throw new NotImplementedError(
          'Mark is trying to render as something other than an element or a text node'
        );
      }
####### Ancestor

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

  private updateTextView(
    view: View,
    modelText: ModelText,
    nodeView: TextView
  ): NodeView {
    if (modelText.isDirty('node') || modelText.isDirty('mark')) {
      const newView = this.createTextView(view, modelText);
      nodeView.viewRoot.replaceWith(newView.viewRoot);
      return newView;
    } else if (modelText.isDirty('content')) {
      nodeView.contentRoot.replaceData(
        0,
        nodeView.contentRoot.length,
        modelText.content
      );
======= end
    }
<<<<<<< variant A

    return result;
>>>>>>> variant B
    return current;
####### Ancestor
    return nodeView;
======= end
  }

  swapElement(node: HTMLElement, replacement: HTMLElement) {
    const children = node.childNodes;
    replacement.append(...children);
    node.replaceWith(replacement);
  }
}

function parentIsLumpNode(modelNode: ModelElement): boolean {
  while (modelNode.parent) {
    const properties = modelNode.parent.getRdfaAttributes().properties;
    if (properties && properties.includes(LUMP_NODE_PROPERTY)) {
      return true;
    }
    modelNode = modelNode.parent;
  }
  return false;
}
