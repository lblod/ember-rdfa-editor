import type Datastore from '#root/utils/_private/datastore/datastore.ts';
import { EditorStore } from '#root/utils/_private/datastore/datastore.ts';

import {
  isElement,
  isTextNode,
  tagName,
} from '#root/utils/_private/dom-helpers.ts';
const weakDsMap = new WeakMap<Node, Datastore<Node>>();

export function getDataStore(node: Node) {
  const root = node.getRootNode();
  if (weakDsMap.has(root)) {
    return weakDsMap.get(root);
  } else {
    const ds = EditorStore.fromParse<Node>({
      parseRoot: true,
      root,
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
        return node.textContent || '';
      },
    });
    weakDsMap.set(root, ds);
    return ds;
  }
}

