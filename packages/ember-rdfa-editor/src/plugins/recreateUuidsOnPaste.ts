import type { Attrs } from 'prosemirror-model';
import { Fragment, Slice, Node, Schema } from 'prosemirror-model';
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
  if (spec['recreateUriFunction']) {
    attrs = (spec['recreateUriFunction'] as (attrs: Attrs) => Attrs)(
      node.attrs,
    );
  }
  if (spec['recreateUri']) {
    if (spec['uriAttributes']) {
      attrs = {
        ...attrs,
        ...recreateUriAttribute(attrs, spec['uriAttributes'] as string[]),
      };
    }
  }
  if (attrs['__rdfaId']) {
    attrs = {
      ...attrs,
      __rdfaId: uuidv4(),
    };
  }
  return schema.node(
    node.type,
    attrs,
    Fragment.fromArray(children),
    node.marks,
  );
}

export default recreateUuidsOnPaste;

export function recreateUriAttribute(
  attrs: Attrs,
  uriAttributes: string[],
): Attrs {
  const newAttributes: Record<string, string> = {};
  for (const uriAttribute of uriAttributes) {
    const oldUri = attrs[uriAttribute] as string;
    const oldUriParts = oldUri.split('/');
    oldUriParts[oldUriParts.length - 1] = uuidv4();
    const newUri = oldUriParts.join('/');
    newAttributes[uriAttribute] = newUri;
  }
  return { ...attrs, ...newAttributes };
}

export function recreateUri(oldUri: string) {
  const oldUriParts = oldUri.split('/');
  oldUriParts[oldUriParts.length - 1] = uuidv4();
  const newUri = oldUriParts.join('/');
  return newUri;
}
