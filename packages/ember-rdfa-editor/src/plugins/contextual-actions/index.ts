import { EditorState, type Command } from 'prosemirror-state';

export type ContextualAction = {
  id: string;
  label: string;
  icon?: string;
  group: string;
  command: Command;
  description?: string;

  priority?: number;
};

export type ContextualActionGroup = {
  id: string;
  label: string;

  sticky?: 'bottom';
  priority?: number;

  getActions: GetContextualActions;
};

export type GetContextualActionGroups = ((
  state: EditorState,
  searchQuery?: string,
) => ContextualActionGroup[])[];
export type GetContextualActions = (
  state: EditorState,
  searchQuery?: string,
) => ContextualAction[] | Promise<ContextualAction[]>;
