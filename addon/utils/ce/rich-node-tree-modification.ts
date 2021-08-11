import RichNode from '@lblod/marawa/rich-node';
import {isTextNode} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

export function replaceRichNodeWith(richNode: RichNode, richNodes: RichNode[]): void  {
  const parent = richNode.parent;
  const indexOfRichNode = parent.children.indexOf(richNode);
  for (const node of richNodes) {
    node.parent = parent;
  }

  parent.children.splice(indexOfRichNode, 1, ...richNodes);
}

/**
 * Split a rich node of type text at the provided (absolute) offset.
 * Will split both the rich node and the underlying text node.
 * NOTE: Does not modify richNode parent or dom tree!
 *
 * @return {[RichNode, RichNode]} List of the two resulting richNodes.
 */
export function splitRichTextNode(richNode: RichNode, offset: number): [RichNode, RichNode] {
  if (offset <= richNode.start || offset >= richNode.end) {
    throw new Error("Invalid offset for splitRichTextNode");
  }

  const textContent = richNode.text;
  const relativeOffset = offset - richNode.start;

  const prefixDomNode = document.createTextNode(textContent.slice(0, relativeOffset));
  const prefixRichNode = new RichNode({
    domNode: prefixDomNode,
    start: richNode.start,
    end: richNode.start + relativeOffset,
    type: "text",
    text: prefixDomNode.textContent || ""
  });

  const postfixDomNode = document.createTextNode(textContent.slice(relativeOffset));
  const postfixRichNode = new RichNode({
    domNode: postfixDomNode,
    start: richNode.start + relativeOffset,
    end: richNode.end,
    type: "text",
    text: postfixDomNode.textContent || ""
  });

  return [prefixRichNode, postfixRichNode];
}

/**
 * Bluntly merges rich nodes, left to right. Siblings need to be provided in order (left to right)
 * and should be of the same type.
 *
 * @param {RichNode[]} richNodes List of rich nodes which should be merged.
 */
export function mergeSiblings(...richNodes: RichNode[]): void {
  const firstNode = richNodes[0];
  if (firstNode.type !== "text" && firstNode.type !== "tag") {
    throw new Error("Illegal merge, can only merge tag or text nodes");
  }

  for (let i = 1; i < richNodes.length; i++) {
    const currentNode = richNodes[i];
    if (currentNode.type !== firstNode.type) {
      throw new Error("Illegal merge, nodes are not of same type");
    }

    firstNode.end = currentNode.end;
    if (firstNode.type === "tag") {
      firstNode.children.push(...currentNode.children);
      for (const child of currentNode.domNode.childNodes) {
        firstNode.domNode.appendChild(child);
      }
    } else if (firstNode.type === "text") {
      const mergedText = `${firstNode.text}${currentNode.text}`;
      firstNode.text = mergedText;
      firstNode.domNode.textContent = mergedText;
    }

    if (currentNode.parent) {
      const index = currentNode.parent.children.indexOf(currentNode);
      currentNode.parent.children.splice(index, 1);
    }
  }
}

export function mergeSiblingTextNodes(richNode: RichNode) {
  const textNode = richNode.domNode;

  while (textNode.previousSibling && isTextNode(textNode.previousSibling)) {
    const previousDOMSibling = textNode.previousSibling;
    const indexOfRichNode = richNode.parent.children.indexOf(richNode);
    const previousRichSibling = richNode.parent.children[indexOfRichNode - 1];
    textNode.textContent = `${previousDOMSibling.textContent || ""}${textNode.textContent || ""}`;

    richNode.start = previousRichSibling.start;
    richNode.parent.children.splice(indexOfRichNode - 1, 1);
    previousDOMSibling.remove();
  }

  while (textNode.nextSibling && isTextNode(textNode.nextSibling)) {
    const nextDOMSibling = textNode.nextSibling;
    const indexOfRichNode = richNode.parent.children.indexOf(richNode);
    const nextRichSibling = richNode.parent.children[indexOfRichNode + 1];
    textNode.textContent = `${textNode.textContent || ""}${nextDOMSibling.textContent || ""}`;

    richNode.end = nextRichSibling.end;
    richNode.parent.children.splice(indexOfRichNode + 1 , 1);
    nextDOMSibling.remove();
  }
}

export function wrapRichNode(richNode: RichNode, wrappingDomNode: Node): void {
  richNode.parent = new RichNode({
    domNode: wrappingDomNode,
    parent: richNode.parent,
    children: [richNode],
    start: richNode.start,
    end: richNode.end,
    type: "tag"
  });
}

export function unwrapRichNode(richNode: RichNode) {
  replaceRichNodeWith(richNode, richNode.children);
}
