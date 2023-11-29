import {
  Decoration,
  DecorationSet,
  EditorState,
  NodeSelection,
  PluginKey,
  PluginView,
  ProsePlugin,
} from '@lblod/ember-rdfa-editor';
import { isEditable } from '@lblod/ember-rdfa-editor/core/say-node-spec';
import { isSome } from '@lblod/ember-rdfa-editor/utils/_private/option';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types';

type State = {
  activeNode?: ResolvedPNode;
};

const activeNode = (
  state: EditorState,
  getPos?: () => number | undefined,
): ResolvedPNode | undefined => {
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
  if (getPos) {
    const basePos = getPos();
    if (isSome(basePos) && isEditable(state.doc)) {
      return { pos: basePos, value: state.doc };
    }
  }
  return;
};

export const editableNodePluginKey = new PluginKey<State>(
  'EDITABLE_BLOCK_NODE',
);
export const editableNodePlugin = (getPos?: () => number | undefined) =>
  new ProsePlugin<State>({
    key: editableNodePluginKey,
    props: {
      decorations(state) {
        const pluginState = this.getState(state);
        if (pluginState?.activeNode) {
          const { value, pos } = pluginState.activeNode;
          if (value === state.doc) {
            return;
          }
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
          activeNode: activeNode(state, getPos),
        };
      },
      apply(_tr, _value, _oldState, newState) {
        return {
          activeNode: activeNode(newState, getPos),
        };
      },
    },

    view(view): PluginView {
      return {
        update(view, prevState) {},
        destroy() {},
      };
    },
  });

export function getActiveEditableNode(state: EditorState) {
  return editableNodePluginKey.getState(state)?.activeNode;
}
