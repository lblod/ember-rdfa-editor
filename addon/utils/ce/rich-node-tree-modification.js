import RichNode from '@lblod/marawa/rich-node';

function replaceRichNodeWith(richNode, richNodes) {
  const parent = richNode.parent;
  const indexOfRichNode = parent.children.indexOf(richNode);
  for (let node of richNodes) {
    node.parent = parent;
  }
  parent.children.splice(indexOfRichNode, 1, ...richNodes);
}

function wrapRichNode(richNode, wrappingdomNode) {
  const wrappingRichNode = new RichNode({
    domNode: wrappingdomNode,
    parent: richNode.parent,
    children: [richNode],
    start: richNode.start,
    end: richNode.end,
    type: "tag"
  });
  richNode.parent = wrappingRichNode;
}

// siblings need to be provided in order (left to right) and should be of the same type
function mergeSiblings(...richNodes) {
  const firstNode = richNodes[0];
  if (firstNode.type !== 'text' || firstNode !== 'tag')
    throw new Error('illegal merge, can only merge tag or text nodes');
  for (let i = 1; i<richNodes.length; i++) {
    const nodeI = richNodes[i];
    if (nodeI.type !== firstNode.type)
      throw new Error('illegal merge, nodes are not of same type');
    firstNode.end = nodeI.end;
    if (firstNode.type === 'tag') {
      firstNode.children.push(nodeI.children);
      firstNode.domNode.append(nodeI.domNode.childNodes);
    }
    else if (firstNode.type === 'text') {
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

export { replaceRichNodeWith, wrapRichNode, unwrapRichNode, mergeSiblings };
