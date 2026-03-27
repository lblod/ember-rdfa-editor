import {
  EditorState,
  Plugin,
  PluginKey,
  type Command,
} from 'prosemirror-state';

export type State = {
  getActions?: ((state: EditorState) => Promise<ContextualAction[]>)[];
  getGroups?: ((state: EditorState) => Promise<ContextualActionGroup[]>)[];
};

export const contextualActionsPluginKey = new PluginKey<State>(
  'CONTEXTUAL_ACTIONS_PLUGIN',
);

export type ContextualAction = {
  id: string;
  label: string;
  group: string;
  command: Command;
  description?: string;

  isVisible?: (state: EditorState) => boolean;
  isEnabled?: (state: EditorState) => boolean;

  priority?: number;
};

export type ContextualActionGroup = {
  id: string;
  label: string;

  isVisible?: (state: EditorState) => boolean;

  priority?: number;
};

export type GetContextualActions = (
  state: EditorState,
) => Promise<ContextualAction[]>;
export type GetContextualActionGroups = (
  state: EditorState,
) => Promise<ContextualActionGroup[]>;

export const actionCallbackStore = {
  getActions: [],
};

export const contextualActionsPlugin = ({ getActions, getGroups }: State) =>
  new Plugin<State>({
    key: contextualActionsPluginKey,
    state: {
      init() {
        actionCallbackStore.getActions = getActions;
        return {
          getActions,
          getGroups,
        };
      },
      apply(tr, value) {
        return value;
      },
    },
  });
