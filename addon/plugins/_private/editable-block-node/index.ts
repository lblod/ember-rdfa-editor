import {
  Decoration,
  DecorationSet,
  EditorState,
  NodeSelection,
  PNode,
  PluginKey,
  ProsePlugin,
} from '@lblod/ember-rdfa-editor';
import { hasGroups } from '@lblod/ember-rdfa-editor/utils/node-utils';

type Block = {
  pos: number;
  node: PNode;
};
type State = {
  activeBlock?: Block;
};

const activeBlock = (state: EditorState): Block | undefined => {
  const { selection } = state;
  if (selection instanceof NodeSelection) {
    if (hasGroups(selection.node, 'editable')) {
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
    if (hasGroups(curNode, 'editable')) {
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
  props: {
    decorations(state) {
      const pluginState = this.getState(state);
      if (pluginState?.activeBlock) {
        const { node, pos } = pluginState.activeBlock;
        const deco = Decoration.node(pos, pos + node.nodeSize, {
          class: 'say-active',
        });
        return DecorationSet.create(state.doc, [deco]);
      } else {
        return;
      }
    },
  },
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
