import type { PluginView } from 'prosemirror-state';
import { EditorState, NodeSelection, PluginKey } from 'prosemirror-state';
import { isEditable } from '@lblod/ember-rdfa-editor/core/say-node-spec.ts';
import { isSome } from '@lblod/ember-rdfa-editor/utils/_private/option.ts';
import type { ResolvedPNode } from '@lblod/ember-rdfa-editor/utils/_private/types.ts';
import { ProsePlugin } from '@lblod/ember-rdfa-editor/prosemirror-aliases.ts';
import { Decoration, DecorationSet } from 'prosemirror-view';

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
  if (isEditable(state.doc)) {
    return {
      pos: -1,
      value: state.doc,
    };
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

    // TODO Maybe delete this method? I didn't as perhaps overriding it enables something, in which
    // case there should be a comment explaining. I left it as I was just fixing linting errors.
    // - Rich
    view(): PluginView {
      return {
        update() {},
        destroy() {},
      };
    },
  });

export function getActiveEditableNode(state: EditorState) {
  return editableNodePluginKey.getState(state)?.activeNode;
}
