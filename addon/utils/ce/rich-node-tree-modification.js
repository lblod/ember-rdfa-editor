import RichNode from '@lblod/marawa/rich-node';

function replaceRichNodeWith(richNode, richNodes) {
  const parent = richNode.parent;
  const indexOfRichNode = parent.children.indexOf(richNode);
  for (let node of richNodes) {
    node.parent = parent;
  }
  parent.children.splice(indexOfRichNode, 1, ...richNodes);
}

/**
 * split a rich node of type text at the provided (absolute) offset
 * will split both the richnode and the underlying text node.
 * NOTE: does not modify richNode parent or dom tree!
 * returns the two resulting richNodes
 */
function splitRichTextNode(richNode, offset) {
  if (offset <= richNode.start || offset >= richNode.end) {
    throw 'invalid offset for splitRichTextNode';
  }
  const textContent = richNode.text;
  const relativeOffset = offset - richNode.start;
  const prefixDomNode = document.createTextNode(
    textContent.slice(0, relativeOffset)
  );
  const prefixRichNode = new RichNode({
    domNode: prefixDomNode,
    start: richNode.start,
    end: richNode.start + relativeOffset,
    type: 'text',
    text: prefixDomNode.textContent,
  });
  const postfixDomNode = document.createTextNode(
    textContent.slice(relativeOffset)
  );
  const postfixRichNode = new RichNode({
    domNode: postfixDomNode,
    start: richNode.start + relativeOffset,
    end: richNode.end,
    type: 'text',
    text: postfixDomNode.textContent,
  });
  return [prefixRichNode, postfixRichNode];
}

function wrapRichNode(richNode, wrappingdomNode) {
  const wrappingRichNode = new RichNode({
    domNode: wrappingdomNode,
    parent: richNode.parent,
    children: [richNode],
    start: richNode.start,
    end: richNode.end,
    type: 'tag',
  });
  richNode.parent = wrappingRichNode;
}

function mergeSiblingTextNodes(richNode) {
  const textNode = richNode.domNode;
  while (
    textNode.previousSibling &&
    textNode.previousSibling.nodeType === Node.TEXT_NODE
  ) {
    const previousDOMSibling = textNode.previousSibling;
    const indexOfRichNode = richNode.parent.children.indexOf(richNode);
    const previousRichSibling = richNode.parent.children[indexOfRichNode - 1];
    textNode.textContent = `${previousDOMSibling.textContent}${textNode.textContent}`;
    richNode.start = previousRichSibling.start;
    richNode.parent.children.splice(indexOfRichNode - 1, 1);
    previousDOMSibling.remove();
  }
  while (
    textNode.nextSibling &&
    textNode.nextSibling.nodeType === Node.TEXT_NODE
  ) {
    const nextDOMSibling = textNode.nextSibling;
    const indexOfRichNode = richNode.parent.children.indexOf(richNode);
    const nextRichSibling = richNode.parent.children[indexOfRichNode + 1];
    textNode.textContent = `${textNode.textContent}${nextDOMSibling.textContent}`;
    richNode.end = nextRichSibling.end;
    richNode.parent.children.splice(indexOfRichNode + 1, 1);
    nextDOMSibling.remove();
  }
}

// siblings need to be provided in order (left to right) and should be of the same type
/**
 * Bluntly merges richnodes, left to right
 *
 * @param {Array<RichNode>} richNodes Set of RichNodes which should be merged.
 */
function mergeSiblings(...richNodes) {
  const firstNode = richNodes[0];
  if (firstNode.type !== 'text' || firstNode !== 'tag')
    throw new Error('illegal merge, can only merge tag or text nodes');
  for (let i = 1; i < richNodes.length; i++) {
    const nodeI = richNodes[i];
    if (nodeI.type !== firstNode.type)
      throw new Error('illegal merge, nodes are not of same type');
    firstNode.end = nodeI.end;
    if (firstNode.type === 'tag') {
      firstNode.children.push(nodeI.children);
      firstNode.domNode.append(nodeI.domNode.childNodes);
    } else if (firstNode.type === 'text') {
      firstNode.textContent = `${firstNode.textContent}${nodeI.textContent}`;
      firstNode.domNode.textContent = `${firstNode.textContent}${nodeI.textContent}`;
    }
    if (nodeI.parent) {
      const index = nodeI.parent.indexOf(nodeI);
      nodeI.parent.children.splice(index, 1);
    }
  }
}

function unwrapRichNode(richNode) {
  replaceRichNodeWith(richNode, richNode.children);
}

export {
  replaceRichNodeWith,
  wrapRichNode,
  unwrapRichNode,
  mergeSiblings,
  mergeSiblingTextNodes,
  splitRichTextNode,
};
