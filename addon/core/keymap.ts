import { redo, undo } from 'prosemirror-history';
import { splitListItem } from 'prosemirror-schema-list';
import { Command } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import { toggleMarkAddFirst } from '@lblod/ember-rdfa-editor/commands/toggle-mark-add-first';

export type Keymap = (schema: Schema) => Record<string, Command>;

export function defaultKeymap(schema: Schema): Record<string, Command> {
  return {
    'Ctrl-z': undo,
    'Ctrl-Shift-z': redo,
    'Ctrl-b': toggleMarkAddFirst(schema.marks['strong']),
    'Ctrl-i': toggleMarkAddFirst(schema.marks['em']),
    'Ctrl-u': toggleMarkAddFirst(schema.marks['underline']),
    Enter: splitListItem(schema.nodes.list_item),
  };
}
