import {
  EditorState,
  type Command,
} from 'prosemirror-state';

export type ContextualAction = {
  id: string;
  label: string;
  group: string;
  command: Command;
  description?: string;

  isVisible?: (state?: EditorState) => boolean;
  isEnabled?: (state?: EditorState) => boolean;

  priority?: number;
};

export type ContextualActionGroup = {
  id: string;
  label: string;

  isVisible?: (state?: EditorState) => boolean;

  priority?: number;
};
