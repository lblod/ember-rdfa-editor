import { N3StoreWrapper } from '#root/utils/_private/datastore/n3-store-wrapper.ts';
import {
  isElement,
  isTextNode,
  tagName,
} from '#root/utils/_private/dom-helpers.ts';
import type { Quad_Subject } from '@rdfjs/types';
import { PreprocessedNode } from './preprocess-html.ts';
import { parseRdfa } from './rdfa-parser.ts';

const SAY_ID_DIVIDER = '>>';

interface SayIdSubjectInfo {
  subject: Quad_Subject;
  connectingQuads: KnowledgeBase;
}

export class KnowledgeBase extends N3StoreWrapper {
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

  private constructor(_dataset?: N3StoreWrapper) {
    super(_dataset);
  }
  public quadsPointingToId(id: string): KnowledgeBase {
    return new KnowledgeBase(
      this.filter((quad) => quad.object.value.split(SAY_ID_DIVIDER)[0] === id),
    );
  }

  public subjectsForSayId(id: string) {
    const quads = this.quadsPointingToId(id);
    const subjectSet = new Map<string, SayIdSubjectInfo>();

    for (const quad of [...quads]) {
      const subjectString = quad.subject.value;
      const seenInfo = subjectSet.get(subjectString);
      if (seenInfo) {
        seenInfo.connectingQuads.add(quad);
      } else {
        subjectSet.set(subjectString, {
          subject: quad.subject,
          connectingQuads: new KnowledgeBase(new N3StoreWrapper([quad])),
        });
      }
    }
    return [...subjectSet.values()];
  }

  public quadsForSayId(
    id: string,
  ): (SayIdSubjectInfo & { otherQuads: KnowledgeBase })[] {
    const subjectInfo = this.subjectsForSayId(id);

    return subjectInfo.map((info) => ({
      ...info,
      otherQuads: new KnowledgeBase(this.match(info.subject)),
    }));
  }
}

function textToParentId(node: Node): string {
  if (isTextNode(node)) {
    const id = node.parentElement?.dataset['sayId'];
    return id ? `${id}${SAY_ID_DIVIDER}` : '';
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
