import { PNode, ProseParser } from '@lblod/ember-rdfa-editor';
import { preprocessRDFa } from '@lblod/ember-rdfa-editor/core/rdfa-processor';
import { Attrs, Schema } from 'prosemirror-model';
import HTMLInputParser from './html-input-parser';
import { enhanceRule } from '@lblod/ember-rdfa-editor/core/schema';
import { tagName } from './dom-helpers';

export function htmlToDoc(
  html: string,
  options: { schema: Schema; parser: ProseParser },
) {
  const { parser } = options;
  const htmlCleaner = new HTMLInputParser({});
  const cleanedHTML = htmlCleaner.cleanupHTML(html);
  const domParser = new DOMParser();
  const parsed = domParser.parseFromString(cleanedHTML, 'text/html').body;
  preprocessRDFa(parsed);
  const topNodeMatch = matchTopNode(parsed, { schema: options.schema });
  let doc: PNode;
  if (topNodeMatch) {
    const { topNode, contentElement } = topNodeMatch;
    doc = parser.parse(contentElement, {
      preserveWhitespace: true,
      topNode,
    });
  } else {
    doc = parser.parse(parsed, { preserveWhitespace: true });
  }
  return doc;
}

function matchTopNode(
  node: HTMLElement,
  options: { schema: Schema },
):
  | {
      topNode: PNode;
      contentElement: HTMLElement;
    }
  | undefined {
  const { schema } = options;
  const topNodeSpec = schema.topNodeType.spec;
  if (!topNodeSpec.parseDOM?.length) {
    return;
  }
  for (const parseRule of topNodeSpec.parseDOM) {
    const enhancedRule = enhanceRule(parseRule);
    let attrs: Attrs | null | undefined | false;
    if (enhancedRule.tag && tagName(node) !== enhancedRule.tag) {
      continue;
    }
    if (enhancedRule.getAttrs) {
      attrs = enhancedRule.getAttrs(node);
    } else if (enhancedRule.attrs) {
      attrs = enhancedRule.attrs;
    }
    if (!attrs) {
      continue;
    }
    const { contentElement: contentElementSelector } = enhancedRule;
    let contentElement: HTMLElement | undefined | null;
    if (enhancedRule.contentElement) {
      switch (typeof contentElementSelector) {
        case 'string':
          contentElement = node.querySelector<HTMLElement>(
            contentElementSelector,
          );
          break;
        case 'function':
          contentElement = contentElementSelector(node);
          break;
        default:
          contentElement = contentElementSelector;
      }
    } else {
      contentElement = node;
    }
    if (contentElement) {
      return {
        topNode: schema.topNodeType.create(attrs),
        contentElement,
      };
    }
  }
  for (const child of node.children) {
    const recResult = matchTopNode(child as HTMLElement, options);
    if (recResult) {
      return recResult;
    }
  }
  return;
}
