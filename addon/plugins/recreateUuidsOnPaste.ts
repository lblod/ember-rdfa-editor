import { Fragment, Slice, Node, Schema } from '@lblod/ember-rdfa-editor';
import { Plugin, PluginKey } from 'prosemirror-state';
import { v4 as uuidv4 } from 'uuid';

export const recreateUuidsOnPasteKey = new PluginKey('RECREATE_UUIDS_ON_PASTE');

const recreateUuidsOnPaste = new Plugin({
  key: recreateUuidsOnPasteKey,
  props: {
    transformPasted(slice, view) {
      const schema = view.state.schema;
      return new Slice(
        recreateUuidsFromFragment(slice.content, schema),
        slice.openStart,
        slice.openEnd,
      );
    },
  },
});

function recreateUuidsFromFragment(fragment: Fragment, schema: Schema) {
  const newNodes: Node[] = [];
  fragment.forEach((node) => {
    const newNode = recreateUuidsOnNode(node, schema);
    newNodes.push(newNode);
  });
  return Fragment.fromArray(newNodes);
}

function recreateUuidsOnNode(node: Node, schema: Schema) {
  if (node.isText) {
    return node;
  }
  const children: Node[] = [];
  node.content.forEach((node) => {
    const child = recreateUuidsOnNode(node, schema);
    children.push(child);
  });
  let attrs = node.attrs;
  const type = node.type;
  const spec = type.spec;
  if (spec['recreateUri']) {
    if (spec['uriAttributes']) {
      const newAttributes: Record<string, string> = {};
      for (const uriAttribute of spec['uriAttributes']) {
        const oldUri = node.attrs[uriAttribute as string] as string;
        const oldUriParts = oldUri.split('/');
        oldUriParts[oldUriParts.length - 1] = uuidv4();
        const newUri = oldUriParts.join('/');
        newAttributes[uriAttribute as string] = newUri;
      }
      attrs = { ...node.attrs, ...newAttributes };
    }
  }
  return schema.node(
    node.type,
    attrs,
    Fragment.fromArray(children),
    node.marks,
  );
}

export default recreateUuidsOnPaste;
