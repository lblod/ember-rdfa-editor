import State from '@lblod/ember-rdfa-editor/core/state';
import { modelToView, View } from '@lblod/ember-rdfa-editor/core/view';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelNode, {
  DirtyType,
} from '@lblod/ember-rdfa-editor/model/model-node';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import {
  isElement,
  isTextNode,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import {
  NotImplementedError,
  WriterError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import { ModelInlineComponent } from '../inline-components/model-inline-component';
import ModelNodeUtils from '../../utils/model-node-utils';
import { isTextOrElement, TextOrElement } from '../../utils/types';
import writeAdjacentHtmlText from './html-adjacent-text-writer';
import writeHtmlInlineComponent from './html-inline-component-writer';

/**
 * Top-level {@link Writer} for HTML documents.
 */
export default class HtmlWriter {
  write(state: State, view: View, node: ModelNode, changes: Set<DirtyType>) {
    const currentView = modelToView(state, view.domRoot, node);
    if (!currentView)
      throw new WriterError('corresponding view to modelNode not found');

    if (ModelNode.isModelElement(node)) {
      if (!isElement(currentView))
        throw new WriterError(
          'corresponding view to modelElement is not an HTML Element'
        );
      let updatedView = currentView;
      if (changes.has('node')) {
        updatedView = this.parseElement(node);
        this.swapElement(currentView, updatedView);
      }
      if (changes.has('content')) {
        const parsedChildren = this.parseChildren(node.children, state);
        updatedView.replaceChildren(...parsedChildren);
      }
    } else if (ModelNode.isModelText(node)) {
      if (!isTextNode(currentView))
        throw new WriterError(
          'corresponding view to modelElement is not an HTML Element'
        );
      const updatedView = currentView;
      if (changes.has('content')) {
        updatedView.textContent = node.content;
      }
    } else if (ModelNode.isModelInlineComponent(node)) {
      if (!isElement(currentView))
        throw new WriterError(
          'corresponding view to modelInlineComponent is not an HTML Element'
        );
      const updatedView = this.parseInlineComponent(node, state);
      if (state.inlineComponentsRegistry.activeComponents.has(node)) {
        state.inlineComponentsRegistry.updateComponentInstanceNode(
          node,
          updatedView
        );
      } else {
        state.inlineComponentsRegistry.addComponentInstance(
          updatedView,
          node.spec.name,
          node
        );
      }
    }
  }
  private parseNode(modelNode: ModelNode, state: State): Node {
    if (ModelNode.isModelElement(modelNode)) {
      return this.parseElement(modelNode);
    } else if (ModelNode.isModelText(modelNode)) {
      return this.parseText(modelNode);
    } else if (ModelNode.isModelInlineComponent(modelNode)) {
      return this.parseInlineComponent(modelNode, state);
    } else {
      throw new NotImplementedError('Unsupported node type');
    }
  }
  parseSubTree(modelNode: ModelNode, state: State): Node {
    if (
      modelNode.isLeaf &&
      ModelNode.isModelElement(modelNode) &&
      !ModelNodeUtils.isLumpNode(modelNode)
    ) {
      return this.parseNode(modelNode, state);
    } else {
      const result = this.parseNode(modelNode, state) as HTMLElement;
      const children = (modelNode as ModelElement).children;
      result.append(...this.parseChildren(children, state));
      return result;
    }
  }
  parseChildren(children: ModelNode[], state: State): Node[] {
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
        parsedChildren.push(this.parseSubTree(child, state));
      }
    }
    if (adjacentTextNodes.length > 0) {
      parsedChildren.push(...this.parseTextNodes(adjacentTextNodes));
    }
    return parsedChildren;
  }
  private parseTextNodes(modelTexts: ModelText[]): Set<Node> {
    return new Set(writeAdjacentHtmlText(modelTexts));
  }

  private parseElement(element: ModelElement): HTMLElement {
    const result = document.createElement(element.type);

    // This will disable the selection of multiple cells on table.
    // Idea reverse-engineered from readctor.
    if (element.type === 'table') {
      result.contentEditable = 'false';
    }
    if (element.type === 'td' || element.type === 'th') {
      if (ModelNodeUtils.parentIsLumpNode(element)) {
        result.contentEditable = 'false';
      } else {
        result.contentEditable = 'true';
      }
    }
    if (ModelNodeUtils.isLumpNode(element)) {
      result.contentEditable = 'false';
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

  private parseInlineComponent(component: ModelInlineComponent, state: State) {
    const node = writeHtmlInlineComponent(component, true);
    if (isElement(node)) {
      state.inlineComponentsRegistry.addComponentInstance(
        node,
        component.spec.name,
        component
      );
    } else {
      throw new NotImplementedError(
        'Inline component should have an htmlelement as root'
      );
    }

    return node;
  }

  swapElement(node: HTMLElement, replacement: HTMLElement) {
    const children = node.childNodes;
    replacement.append(...children);
    node.replaceWith(replacement);
  }
}
