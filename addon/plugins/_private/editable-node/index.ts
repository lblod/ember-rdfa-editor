import {
  Decoration,
  DecorationSet,
  EditorState,
  NodeSelection,
  PNode,
  PluginKey,
  ProsePlugin,
} from '@lblod/ember-rdfa-editor';
import { isEditable } from '@lblod/ember-rdfa-editor/core/say-node-spec';

export type ResolvedNode = {
  pos: number;
  value: PNode;
};
type State = {
  activeNode?: ResolvedNode;
};

const activeNode = (state: EditorState): ResolvedNode | undefined => {
  const { selection } = state;
  if (selection instanceof NodeSelection) {
    if (isEditable(selection.node)) {
      return {
        pos: selection.from,
        value: selection.node,
      };
    }
  }
  const from = selection.$from;
  for (let depth = from.depth; depth > 0; depth--) {
    const curNode = from.node(depth);
    const pos = from.before(depth);
    if (isEditable(curNode)) {
      return {
        pos,
        value: curNode,
      };
    }
  }
  return;
};

export const editableNodePluginKey = new PluginKey<State>(
  'EDITABLE_BLOCK_NODE',
);
export const editableNodePlugin = new ProsePlugin<State>({
  key: editableNodePluginKey,
  props: {
    decorations(state) {
      const pluginState = this.getState(state);
      if (pluginState?.activeNode) {
        const { value, pos } = pluginState.activeNode;
        const deco = Decoration.node(pos, pos + value.nodeSize, {
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
        activeNode: activeNode(state),
      };
    },
    apply(_tr, _value, _oldState, newState) {
      return {
        activeNode: activeNode(newState),
      };
    },
  },
});

export function getActiveEditableNode(state: EditorState) {
  return editableNodePluginKey.getState(state)?.activeNode;
}
