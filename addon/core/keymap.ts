import { redo, undo } from 'prosemirror-history';
import { splitListItem } from 'prosemirror-schema-list';
import { Command } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import { toggleMark } from 'prosemirror-commands';

export type Keymap = (schema: Schema) => Record<string, Command>;

export function defaultKeymap(schema: Schema): Record<string, Command> {
  return {
    'Ctrl-z': undo,
    'Ctrl-Shift-z': redo,
    'Ctrl-b': toggleMark(schema.marks['strong']),
    'Ctrl-i': toggleMark(schema.marks['em']),
    'Ctrl-u': toggleMark(schema.marks['underline']),
    Enter: splitListItem(schema.nodes.list_item),
  };
}
