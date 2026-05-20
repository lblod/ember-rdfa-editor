import type { N3StoreWrapper } from '#root/utils/_private/datastore/n3-store-wrapper.ts';
import {
  isElement,
  isTextNode,
  tagName,
} from '#root/utils/_private/dom-helpers.ts';
import { parse } from './new-parser.ts';
import { v4 as uuidv4 } from 'uuid';
const weakDsMap = new WeakMap<Node, N3StoreWrapper>();

export function getDataStore(node: Node) {
  const root = node.getRootNode();
  if (weakDsMap.has(root)) {
    return weakDsMap.get(root);
  } else {
    const tw = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT);
    let curNode: HTMLElement | null;
    do {
      curNode = tw.nextNode() as HTMLElement;
      if (curNode) {
        const id = uuidv4();
        curNode.dataset['sayId'] = id;
      }
    } while (curNode);
    const rootCopy = root.cloneNode(true);
    const ds = parse({
      parseRoot: true,
      root: rootCopy,
      tag: tagName,
      baseIRI: 'http://example.org',
      attributes(node: Node): Record<string, string> {
        if (isElement(node)) {
          const result: Record<string, string> = {};
          for (const attr of node.attributes) {
            result[attr.name] = attr.value;
          }
          return result;
        }
        return {};
      },
      isText: isTextNode,
      children(node: Node): Iterable<Node> {
        return node.childNodes;
      },
      textContent(node: Node): string {
        if (isTextNode(node)) {
          return `${node.parentElement?.dataset['sayId']}>>` ?? '';
        } else if (isElement(node)) {
          return node.dataset['sayId'] ?? '';
        }
        return '';
      },
    });
    weakDsMap.set(root, ds.dataset);
    console.log('made dataset', [...ds.dataset]);
    return ds.dataset;
  }
}
