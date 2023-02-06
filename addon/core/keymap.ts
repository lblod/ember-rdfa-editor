import { redo, undo } from 'prosemirror-history';
import { splitListItem } from 'prosemirror-schema-list';
import { Command } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import { toggleMarkAddFirst } from '@lblod/ember-rdfa-editor/commands/toggle-mark-add-first';
import {
  chainCommands,
  createParagraphNear,
  deleteSelection,
  exitCode,
  joinBackward,
  joinForward,
  newlineInCode,
  selectAll,
  selectNodeBackward,
  selectNodeForward,
  selectTextblockEnd,
  selectTextblockStart,
} from 'prosemirror-commands';
import { insertHardBreak } from '@lblod/ember-rdfa-editor/commands/insert-hard-break';
import selectParentNodeOfType from '../commands/select-parent-node-of-type';
import { splitBlockChecked } from '../commands/split-block-checked';
import { liftEmptyBlockChecked } from '@lblod/ember-rdfa-editor/commands/lift-empty-block-checked';

export type Keymap = (schema: Schema) => Record<string, Command>;

const backspace = chainCommands(
  deleteSelection,
  (state, dispatch, view) => {
    if (joinBackward(state, dispatch) && dispatch && view) {
      const { state } = view;
      selectParentNodeOfType(state.schema.nodes.table)(state, dispatch, view);
      return true;
    }
    return false;
  },
  selectNodeBackward
);
const del = chainCommands(
  deleteSelection,
  (state, dispatch, view) => {
    if (joinForward(state, dispatch) && dispatch && view) {
      const { state } = view;
      selectParentNodeOfType(state.schema.nodes.table)(state, dispatch, view);
      return true;
    }
    return false;
  },
  selectNodeForward
);
/// A basic keymap containing bindings not specific to any schema.
/// Binds the following keys (when multiple commands are listed, they
/// are chained with [`chainCommands`](#commands.chainCommands)):
///
/// * **Enter** to `newlineInCode`, `createParagraphNear`, `liftEmptyBlock`, `splitBlock`
/// * **Mod-Enter** to `exitCode`
/// * **Backspace** and **Mod-Backspace** to `deleteSelection`, `joinBackward`, `selectNodeBackward`
/// * **Delete** and **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
/// * **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
/// * **Mod-a** to `selectAll`
export const pcBaseKeymap: Keymap = (schema: Schema) => ({
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
  Enter: chainCommands(
    splitListItem(schema.nodes.list_item),
    newlineInCode,
    createParagraphNear,
    liftEmptyBlockChecked,
    splitBlockChecked,
    insertHardBreak
  ),
  'Shift-Enter': chainCommands(exitCode, insertHardBreak),
  'Mod-Enter': exitCode,
  Backspace: backspace,
  'Mod-Backspace': backspace,
  'Shift-Backspace': backspace,
  Delete: del,
  'Mod-Delete': del,
  'Mod-a': selectAll,
});

/// A copy of `pcBaseKeymap` that also binds **Ctrl-h** like Backspace,
/// **Ctrl-d** like Delete, **Alt-Backspace** like Ctrl-Backspace, and
/// **Ctrl-Alt-Backspace**, **Alt-Delete**, and **Alt-d** like
/// Ctrl-Delete.
export const macBaseKeymap: Keymap = (schema: Schema) => {
  const pcmap = pcBaseKeymap(schema);
  return {
    ...pcmap,
    'Ctrl-h': pcmap['Backspace'],
    'Alt-Backspace': pcmap['Mod-Backspace'],
    'Ctrl-d': pcmap['Delete'],
    'Ctrl-Alt-Backspace': pcmap['Mod-Delete'],
    'Alt-Delete': pcmap['Mod-Delete'],
    'Alt-d': pcmap['Mod-Delete'],
    'Ctrl-a': selectTextblockStart,
    'Ctrl-e': selectTextblockEnd,
  };
};

declare const os: { platform?(): string } | undefined;
let mac: boolean;
if (typeof navigator !== 'undefined') {
  mac = /Mac|iP(hone|[oa]d)/.test(navigator.platform);
} else {
  if (typeof os !== 'undefined' && os.platform) {
    mac = os.platform() === 'darwin';
  } else {
    mac = false;
  }
}
export const baseKeymap: Keymap = mac ? macBaseKeymap : pcBaseKeymap;
