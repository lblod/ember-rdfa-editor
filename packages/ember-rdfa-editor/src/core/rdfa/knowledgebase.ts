import type { Dataset, Quad } from '@rdfjs/types';
import { PreprocessedNode } from './preprocess-html.ts';
import {
  isTextNode,
  isElement,
  tagName,
} from '#root/utils/_private/dom-helpers.ts';
import { parseRdfa } from './rdfa-parser.ts';

export class KnowledgeBase {
  static kbCache: WeakMap<Node, KnowledgeBase> = new WeakMap();

  static fromHtmlNode(node: Node): KnowledgeBase {
    // console.log('ROOT', node.getRootNode());
    const preNode = new PreprocessedNode(node.getRootNode());
    return this.fromPreprocessedNode(preNode);
  }
  static fromPreprocessedNode(preNode: PreprocessedNode): KnowledgeBase {
    const node = preNode.htmlNode;
    const cached = this.kbCache.get(node);
    if (cached) {
      return cached;
    } else {
      const parseResult = parseRdfa({
        parseRoot: true,
        root: node,
        tag: tagName,
        baseIRI: preNode.htmlNode.baseURI,
        attributes: attrsToRecord,
        isText: isTextNode,
        children(node: Node): Iterable<Node> {
          return node.childNodes;
        },
        textContent: textToParentId,
      });
      const kb = new KnowledgeBase(parseResult.dataset);
      this.kbCache.set(node, kb);
      return kb;
    }
  }

  static bustCache(preNode: PreprocessedNode) {
    this.kbCache.delete(preNode.htmlNode);
  }

  private constructor(private _dataset: Dataset<Quad, Quad>) {}

  public get dataset(): Dataset<Quad, Quad> {
    return this._dataset;
  }
}

function textToParentId(node: Node): string {
  if (isTextNode(node)) {
    const id = node.parentElement?.dataset['sayId'];
    return id ? `${id}>>` : '';
  } else if (isElement(node)) {
    return node.dataset['sayId'] ?? '';
  }
  return '';
}

function attrsToRecord(node: Node): Record<string, string> {
  if (isElement(node)) {
    const result: Record<string, string> = {};
    for (const attr of node.attributes) {
      result[attr.name] = attr.value;
    }
    return result;
  }
  return {};
}
