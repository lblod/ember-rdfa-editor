import { PNode, ProsePlugin, RdfaEditorView } from '@lblod/ember-rdfa-editor';
export const linkHandler: ProsePlugin = new ProsePlugin({
  props: {
    handleClickOn(
      view: RdfaEditorView,
      pos: number,
      node: PNode,
      nodePos: number,
      event: MouseEvent
    ) {
      const schema = view.state.schema;

      // The handler only handles clicks on nodes, and the link is a mark of the textnode inside the node, so we have to get it

      const textNode = view.state.doc.nodeAt(pos);
      if (!textNode) {
        return;
      }
      const linkMark = textNode.marks.find(
        (mark) => mark.type === schema.marks['link']
      );
      if (linkMark) {
        if (event.ctrlKey || event.metaKey) {
          window.open(linkMark.attrs['href']);
        }
      }
    },
  },
});
