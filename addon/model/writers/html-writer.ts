import State from '@lblod/ember-rdfa-editor/core/state';
import { View } from '@lblod/ember-rdfa-editor/core/view';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import HtmlElementWriter, {
  parentIsLumpNode,
} from '@lblod/ember-rdfa-editor/model/writers/html-element-writer';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/errors';
import { isTextOrElement, TextOrElement } from '../util/types';
import HtmlAdjacentTextWriter from './html-adjacent-text-writer';
type Difference = 'type' | 'tag' | 'attrs' | 'content' | 'none';

/**
 * Top-level {@link Writer} for HTML documents.
 */
export default class HtmlWriter {
  private htmlAdjacentTextWriter: HtmlAdjacentTextWriter;
  private htmlElementWriter: HtmlElementWriter;

  constructor() {
    this.htmlAdjacentTextWriter = new HtmlAdjacentTextWriter();
    this.htmlElementWriter = new HtmlElementWriter();
  }

  write(state: State, view: View) {
    const domRoot = view.domRoot;
    const modelRoot = state.document;
    if (modelRoot.children.length !== domRoot.childNodes.length) {
      const parsedChildren = this.parseChildren(modelRoot.children);
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
        !this.areDomAttributesSame(
          parsedNode.attributes,
          (domNode as Element).attributes
        )
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
  parseSubTree(modelNode: ModelNode): Node {
    if (modelNode.isLeaf) {
      return this.parseNode(modelNode);
    } else {
      const result = this.parseNode(modelNode) as HTMLElement;
      const children = (modelNode as ModelElement).children;
      result.append(...this.parseChildren(children));
      return result;
    }
  }
  parseChildren(children: ModelNode[]): Node[] {
    let adjacentTextNodes = [];
    const parsedChildren = [];
    for (const child of children) {
      if (ModelNode.isModelText(child)) {
        adjacentTextNodes.push(child);
      } else {
        if (adjacentTextNodes.length > 0) {
          // process adjacent text nodes
          parsedChildren.push(...this.parseTextNodes(adjacentTextNodes));
          adjacentTextNodes = [];
        }
        parsedChildren.push(this.parseSubTree(child));
      }
    }
    if (adjacentTextNodes.length > 0) {
      parsedChildren.push(...this.parseTextNodes(adjacentTextNodes));
    }
    return parsedChildren;
  }
  private parseTextNodes(modelTexts: ModelText[]): Set<Node> {
    return new Set(this.htmlAdjacentTextWriter.write(modelTexts));
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
    }
    return current;
  }

  swapElement(node: HTMLElement, replacement: HTMLElement) {
    const children = node.childNodes;
    replacement.append(...children);
    node.replaceWith(replacement);
  }
}
