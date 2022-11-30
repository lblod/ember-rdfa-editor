import { redo, undo } from 'prosemirror-history';
import { splitListItem } from 'prosemirror-schema-list';
import { Command } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';

export type Keymap = (schema: Schema) => Record<string, Command>;

export function defaultKeymap(schema: Schema): Record<string, Command> {
  return {
    'Ctrl-z': undo,
    'Ctrl-Shift-z': redo,
    Enter: splitListItem(schema.nodes.list_item),
  };
}
