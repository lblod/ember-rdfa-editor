import { redo, undo } from 'prosemirror-history';
import { splitListItem } from 'prosemirror-schema-list';
import { Command } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import { toggleMarkAddFirst } from '@lblod/ember-rdfa-editor/commands/toggle-mark-add-first';
import { chainCommands, exitCode } from 'prosemirror-commands';

export type Keymap = (schema: Schema) => Record<string, Command>;

export function defaultKeymap(schema: Schema): Record<string, Command> {
  return {
    'Ctrl-z': undo,
    'Ctrl-Z': undo,
    'Ctrl-y': redo,
    'Ctrl-Y': redo,
    'Ctrl-b': toggleMarkAddFirst(schema.marks['strong']),
    'Ctrl-B': toggleMarkAddFirst(schema.marks['strong']),
    'Ctrl-i': toggleMarkAddFirst(schema.marks['em']),
    'Ctrl-I': toggleMarkAddFirst(schema.marks['em']),
    'Ctrl-u': toggleMarkAddFirst(schema.marks['underline']),
    'Ctrl-U': toggleMarkAddFirst(schema.marks['underline']),
    Enter: splitListItem(schema.nodes.list_item),
    'Shift-Enter': chainCommands(exitCode, (state, dispatch) => {
      if (dispatch)
        dispatch(
          state.tr
            .replaceSelectionWith(schema.nodes.hard_break.create())
            .scrollIntoView()
        );
      return true;
    }),
  };
}
