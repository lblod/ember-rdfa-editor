import {
  EditorState,
  NodeSelection,
  PNode,
  PluginKey,
  ProsePlugin,
} from '@lblod/ember-rdfa-editor';

type Block = {
  pos: number;
  node: PNode;
};
type State = {
  activeBlock?: Block;
};

const activeBlock = (state: EditorState): Block | undefined => {
  const { selection, schema } = state;
  if (selection instanceof NodeSelection) {
    if (selection.node.type === schema.nodes.editable_block) {
      return {
        pos: selection.from,
        node: selection.node,
      };
    }
  }
  const from = selection.$from;
  for (let depth = from.depth; depth > 0; depth--) {
    const curNode = from.node(depth);
    const pos = from.before(depth);
    if (curNode.type === schema.nodes.editable_block) {
      return {
        pos,
        node: curNode,
      };
    }
  }
  return;
};

export const editableBlockNodePluginKey = new PluginKey<State>(
  'EDITABLE_BLOCK_NODE',
);
export const editableBlockNodePlugin = new ProsePlugin<State>({
  key: editableBlockNodePluginKey,
  state: {
    init(_, state) {
      return {
        activeBlock: activeBlock(state),
      };
    },
    apply(_tr, _value, _oldState, newState) {
      return {
        activeBlock: activeBlock(newState),
      };
    },
  },
});

export function getActiveEditableBlock(state: EditorState) {
  return editableBlockNodePluginKey.getState(state)?.activeBlock;
}
