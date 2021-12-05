import flatMap from './flat-map';
import { warn } from '@ember/debug';
import RichNode from '@lblod/marawa/rich-node';

export default function getRichNodeMatchingDomNode(
  domNode: Node | null,
  tree: RichNode
): RichNode | null {
  if (!tree) {
    throw new Error('Invalid argument.');
  }

  if (!domNode || !domNode.nodeType) {
    warn('getRichNodeMatchingDomNode: no domNode provided.', {
      id: 'utils.no-matching-node-in-tree',
    });
    return null;
  }

  const nodeList = flatMap(
    tree,
    (richNode) => {
      return richNode.domNode.isSameNode(domNode);
    },
    true
  );

  if (nodeList.length === 1) {
    return nodeList[0];
  } else {
    warn('getRichNodeMatchingDomNode: no matching node found in tree.', {
      id: 'utils.no-matching-node-in-tree',
    });
    return null;
  }
}
