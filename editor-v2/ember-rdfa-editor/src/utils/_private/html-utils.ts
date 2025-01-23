import { PNode, ProseParser } from '#root';
import { preprocessRDFa } from '#root/core/rdfa-processor';
import type { Attrs, Schema } from 'prosemirror-model';
import HTMLInputParser from './html-input-parser';
import { getPathFromRoot, tagName } from './dom-helpers';
import { EditorView } from 'prosemirror-view';
import type { HEADING_ELEMENTS } from './constants';

export function htmlToDoc(
  html: string,
  options: {
    schema: Schema;
    parser: ProseParser;
    editorView?: EditorView;
    doNotClean?: boolean;
  },
) {
  const { parser } = options;
  const htmlCleaner = new HTMLInputParser();
  const cleanedHTML = htmlCleaner.prepareHTML(html, false, options.doNotClean);
  const domParser = new DOMParser();
  const parsed = domParser.parseFromString(cleanedHTML, 'text/html').body;
  preprocessRDFa(
    parsed,
    options.editorView && getPathFromRoot(options.editorView.dom, false),
  );
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

export function htmlToFragment(
  html: string,
  options: {
    parser: ProseParser;
    editorView: EditorView;
    doNotClean?: boolean;
  },
) {
  const { parser, editorView } = options;
  const htmlCleaner = new HTMLInputParser();
  const cleanedHTML = htmlCleaner.prepareHTML(html, false, options.doNotClean);
  const domParser = new DOMParser();
  const parsed = domParser.parseFromString(cleanedHTML, 'text/html').body;
  preprocessRDFa(parsed, getPathFromRoot(editorView.dom, false));
  return parser.parseSlice(parsed, { preserveWhitespace: true });
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
    let attrs: Attrs | null | undefined | false;
    if (parseRule.tag && tagName(node) !== parseRule.tag) {
      continue;
    }
    if (parseRule.getAttrs) {
      attrs = parseRule.getAttrs(node);
    } else if (parseRule.attrs) {
      attrs = parseRule.attrs;
    }
    if (!attrs) {
      continue;
    }
    const { contentElement: contentElementSelector } = parseRule;
    let contentElement: HTMLElement | undefined | null;
    if (parseRule.contentElement) {
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

export function getHeadingLevel(headingElement: HTMLHeadingElement) {
  const tagName = headingElement.tagName as (typeof HEADING_ELEMENTS)[number];
  return Number(tagName.substring(1));
}

export function constructInlineStyles(
  styles: Record<string, string | undefined>,
) {
  let result = '';
  Object.entries(styles).forEach(([key, value]) => {
    if (value) {
      result += `${key}: ${value};`;
    }
  });
  return result;
}
