import { Command } from 'prosemirror-state';
import { isTextNode } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { DOMParser as ProseParser } from 'prosemirror-model';
import { normalToPreWrapWhiteSpace } from '@lblod/ember-rdfa-editor/utils/whitespace-collapsing';
export function insertHtml(
  html: Node | string,
  from: number,
  to: number,
  preserveWhitespace = false
): Command {
  return function (state, dispatch) {
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
      const fragment = ProseParser.fromSchema(state.schema).parseSlice(
        htmlNode,
        {
          preserveWhitespace,
        }
      ).content;

      const tr = state.tr;
      tr.replaceWith(from, to, fragment);
      dispatch(tr);
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
