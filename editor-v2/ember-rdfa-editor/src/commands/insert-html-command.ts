import type { Command } from 'prosemirror-state';
import {
  getPathFromRoot,
  isTextNode,
} from '#root/utils/_private/dom-helpers';
import { DOMParser as ProseParser, Fragment, Mark } from 'prosemirror-model';
import { normalToPreWrapWhiteSpace } from '#root/utils/_private/whitespace-collapsing';
import { preprocessRDFa } from '#root/core/rdfa-processor';
import { PNode } from '..';

export function insertHtml(
  html: Node | string,
  from: number,
  to: number,
  marks?: Mark[],
  preserveWhitespace = false,
  shouldPreprocessRdfa = false,
): Command {
  return function (state, dispatch, view) {
    if (dispatch) {
      let htmlNode: Node | Document;
      if (typeof html === 'string') {
        const domParser = new DOMParser();
        htmlNode = domParser.parseFromString(html, 'text/html');
      } else {
        htmlNode = html;
      }
      if (!preserveWhitespace) {
        cleanUpNode(htmlNode);
      }
      if (shouldPreprocessRdfa) {
        preprocessRDFa(
          'body' in htmlNode ? htmlNode.body : htmlNode,
          view ? getPathFromRoot(view.dom, false) : [],
        );
      }
      let fragment = ProseParser.fromSchema(state.schema).parseSlice(htmlNode, {
        preserveWhitespace,
      }).content;
      if (marks?.length) {
        const nodesWithMarks: PNode[] = [];
        fragment.forEach((node) => {
          nodesWithMarks.push(node.mark([...marks, ...node.marks]));
        });
        fragment = Fragment.from(nodesWithMarks);
      }
      const tr = state.tr;
      tr.replaceWith(from, to, fragment);
      tr.scrollIntoView();
      dispatch(tr);
      view?.focus();
    }
    return true;
  };
}

function cleanUpNode(node: Node) {
  if (isTextNode(node)) {
    node.textContent = normalToPreWrapWhiteSpace(node);
  } else if ('childNodes' in node) {
    node.childNodes.forEach(cleanUpNode);
  }
}
