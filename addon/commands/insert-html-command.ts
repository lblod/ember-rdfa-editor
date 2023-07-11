import { Command } from 'prosemirror-state';
import { isTextNode } from '@lblod/ember-rdfa-editor/utils/_private/dom-helpers';
import { DOMParser as ProseParser, Fragment, Mark } from 'prosemirror-model';
import { normalToPreWrapWhiteSpace } from '@lblod/ember-rdfa-editor/utils/_private/whitespace-collapsing';
import { PNode } from '..';
export function insertHtml(
  html: Node | string,
  from: number,
  to: number,
  marks?: Mark[],
  preserveWhitespace = false,
): Command {
  return function (state, dispatch, view) {
    if (dispatch) {
      let htmlNode: Node;
      if (typeof html === 'string') {
        const domParser = new DOMParser();
        htmlNode = domParser.parseFromString(html, 'text/html');
      } else {
        htmlNode = html;
      }
      if (!preserveWhitespace) {
        cleanUpNode(htmlNode);
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
