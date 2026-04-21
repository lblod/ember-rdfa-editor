import { EditorState, type Command } from 'prosemirror-state';

export type ContextualAction = {
  id: string;
  label: string;
  group: string;
  command: Command;
  description?: string;

  priority?: number;
};

export type ContextualActionGroup = {
  id: string;
  label: string;

  priority?: number;
};

export type GetContextualActionGroups = ((
  state: EditorState,
) => ContextualActionGroup[])[];
export type GetContextualActions = ((
  state: EditorState,
) => ContextualAction[] | Promise<ContextualAction[]>)[];
