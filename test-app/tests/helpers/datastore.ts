import { EditorStore } from '@lblod/ember-rdfa-editor/utils/_private/datastore/datastore';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';

export function calculateDataset(html: string) {
  const domParser = new DOMParser();
  const parsedHTML = domParser.parseFromString(html, 'text/html');
  const datastore = EditorStore.fromParse<Node>({
    parseRoot: true,
    root: parsedHTML,
    baseIRI: 'http://example.org',
    tag: tagName,
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
    pathFromDomRoot: [],
    textContent(node: Node): string {
      return node.textContent || '';
    },
  });
  return datastore.dataset;
}
