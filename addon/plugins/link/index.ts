import {
  MarkType,
  NodeType,
  PNode,
  ProsePlugin,
  EditorView,
  SayView,
  Slice,
} from '@lblod/ember-rdfa-editor';
import linkifyFragment from '@lblod/ember-rdfa-editor/utils/_private/linkify-fragment';

export { link as linkMark } from './mark/link';
export { link, linkView } from './nodes/link';
export const linkHandler: ProsePlugin = new ProsePlugin({
  props: {
    handleClickOn(
      view: EditorView | SayView,
      pos: number,
      node: PNode,
      nodePos: number,
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
          window.open(linkMark.attrs['href']);
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
