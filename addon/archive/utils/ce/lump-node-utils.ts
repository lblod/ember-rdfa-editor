import previousTextNode from './previous-text-node';
import nextTextNode from './next-text-node';
import {isElement} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

/**
 * So, what is a lumpNode?
 * A (collection of) nodes which should behave as an unsplittable chunk; so you cannot type in it,
 * you backspace it as a whole and the cursor should not enter.
 * Initially I called it blockNode, but since 'block' already means something in HTML, I had to look for alternatives.
 *
 * HOW TO USE IT
 * -------------
 * In the HTML-tree, the following would work.
 * <div property='http://lblod.data.gift/vocabularies/editor/isLumpNode'> whatever content. </div>
 *
 * TODO
 * ----
 * - property='http://lblod.data.gift/vocabularies/editor/isLumpNode': no prefixed URI will work.
 *   This due to performance reasons of MARAWA, which would slow everything, as long as no incremental changes are supported.
 * - wiring: There is currently a dichotomy between CE and RDFA editor and even though this is contained in CE,
 *           whilst using RDFA here this means it probably should not belong here. So location will change.
 */
const LUMP_NODE_URI = "http://lblod.data.gift/vocabularies/editor/isLumpNode";

export function isInLumpNode(node: Node, rootNode: HTMLElement): boolean {
  return !!getParentLumpNode(node, rootNode);
}

/**
 * Return node if it is a lump node. Walk up the tree to find one
 * otherwise, until you hit rootElement. Return null if no node found.
 *
 * @param {Node} node
 * @param {HTMLElement} rootNode
 * @return {Node | null}
 */
export function getParentLumpNode(node: Node, rootNode: HTMLElement): HTMLElement | null {
  if (isElement(node)) {
    if (hasLumpNodeProperty(node)) {
      return node;
    }

    if (node === rootNode) {
      return null;
    }
  }

  if (node.parentNode) {
    return getParentLumpNode(node.parentNode, rootNode);
  }

  return null;
}

export function getPreviousNonLumpTextNode(node: Node, rootNode: HTMLElement): Text | null {
  if (isInLumpNode(node, rootNode)) {
    const parentLumpNode = getParentLumpNode(node, rootNode);
    if (!parentLumpNode) {
      return null;
    }

    const previousNode = previousTextNode(parentLumpNode, rootNode);
    if (!previousNode) {
      return null;
    }

    if (isInLumpNode(previousNode, rootNode)) {
      return getPreviousNonLumpTextNode(previousNode, rootNode);
    } else {
      return previousNode;
    }
  } else {
    return previousTextNode(node, rootNode);
  }
}

export function getNextNonLumpTextNode(node: Node, rootNode: HTMLElement): Text | null {
  if (isInLumpNode(node, rootNode)) {
    const parentLumpNode = getParentLumpNode(node, rootNode);
    if (!parentLumpNode) {
      return null;
    }

    const nextNode = nextTextNode(parentLumpNode, rootNode);
    if (!nextNode) {
      return null;
    }

    if (isInLumpNode(nextNode, rootNode)) {
      return getNextNonLumpTextNode(nextNode, rootNode);
    } else {
      return nextNode;
    }
  } else {
    return nextTextNode(node, rootNode);
  }
}

export function hasLumpNodeProperty(element: HTMLElement): boolean {
  const attribute: string | null = element.getAttribute("property");
  if (!attribute) {
    return false;
  }

  return attribute.indexOf(LUMP_NODE_URI) > -1;
}

export function animateLumpNode(element: HTMLElement): void {
  const animationClass = "lump-node-highlight";

  element.classList.add(animationClass);
  window.setTimeout(() => element.classList.remove(animationClass), 500);
}
