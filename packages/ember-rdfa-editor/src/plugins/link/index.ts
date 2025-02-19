import { MarkType, NodeType, Slice } from 'prosemirror-model';
import { PNode, ProsePlugin } from '#root/prosemirror-aliases.ts';
import { EditorView } from 'prosemirror-view';
import SayView from '#root/core/say-view.ts';

import linkifyFragment from '#root/utils/_private/linkify-fragment.ts';

export { link as linkMark } from './mark/link.ts';
export { link, linkView } from './nodes/link.ts';
export const linkHandler: ProsePlugin = new ProsePlugin({
  props: {
    handleClickOn(
      view: EditorView | SayView,
      pos: number,
      _node: PNode,
      _nodePos: number,
      event: MouseEvent,
    ) {
      const schema = view.state.schema;

      // The handler only handles clicks on nodes, and the link is a mark of the textnode inside the node, so we have to get it

      const textNode = view.state.doc.nodeAt(pos);
      if (!textNode) {
        return;
      }
      const linkMark = textNode.marks.find(
        (mark) => mark.type === schema.marks['link'],
      );
      if (linkMark) {
        if (event.ctrlKey || event.metaKey) {
          window.open(linkMark.attrs['href'] as string);
        }
      }
    },
  },
});

export function linkPasteHandler(linkType: NodeType | MarkType) {
  return new ProsePlugin({
    props: {
      transformPasted(slice, view) {
        return new Slice(
          linkifyFragment(slice.content, linkType, view.state.schema),
          slice.openStart,
          slice.openEnd,
        );
      },
    },
  });
}
