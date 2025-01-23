import { redo, undo } from 'prosemirror-history';
import {
  liftListItem,
  sinkListItem,
  splitListItem,
} from 'prosemirror-schema-list';
import type { Command } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';
import { toggleMarkAddFirst } from '@lblod/ember-rdfa-editor/commands/toggle-mark-add-first';
import {
  chainCommands,
  createParagraphNear,
  deleteSelection,
  exitCode,
  joinBackward,
  joinForward,
  liftEmptyBlock,
  newlineInCode,
  selectAll,
  selectTextblockEnd,
  selectTextblockStart,
  splitBlock,
} from 'prosemirror-commands';
import {
  insertHardBreak,
  reduceIndent,
  liftEmptyBlockChecked,
  selectNodeBackward,
  selectNodeForward,
  selectBlockRdfaNode,
} from '@lblod/ember-rdfa-editor/commands';
import selectParentNodeOfType from '../commands/select-parent-node-of-type';
import { hasParentNodeOfType } from '@curvenote/prosemirror-utils';
import { undoInputRule } from 'prosemirror-inputrules';
import { setAlignment } from '../plugins/alignment/commands';

/**
 * @deprecated KeymapOptions is deprecated.
 * The behaviour of `selectBlockRdfaNode` is now enabled by default.
 */
export type KeymapOptions = {
  backspace?: {
    /**
     * Enables alternative behaviour for backspace.
     * Instead of deleting into the preceding block_rdfa node, it will select the preceding block_rdfa node.
     *
     * `block_rdfa` node has to enhanced with `isolating: true, selectable: true` in the schema.
     */
    selectBlockRdfaNode: boolean;
  };
};

export type Keymap = (
  schema: Schema,
  options?: KeymapOptions,
) => Record<string, Command>;

const backspaceBase: Command[] = [
  undoInputRule,
  reduceIndent,
  deleteSelection,
  (state, dispatch, view) => {
    const isInTable = hasParentNodeOfType(state.schema.nodes['table'])(
      state.selection,
    );
    if (joinBackward(state, dispatch) && dispatch && view) {
      const { state } = view;
      if (!isInTable) {
        selectParentNodeOfType(state.schema.nodes['table'])(
          state,
          dispatch,
          view,
        );
      }
      return true;
    }
    return false;
  },
  selectNodeBackward,
];

const getBackspaceCommand = (options?: KeymapOptions) => {
  if (options?.backspace?.selectBlockRdfaNode) {
    return chainCommands(selectBlockRdfaNode, ...backspaceBase);
  }

  return chainCommands(...backspaceBase);
};

const del = chainCommands(
  deleteSelection,
  (state, dispatch, view) => {
    const isInTable = hasParentNodeOfType(state.schema.nodes['table'])(
      state.selection,
    );
    if (joinForward(state, dispatch) && dispatch && view) {
      const { state } = view;
      if (!isInTable) {
        selectParentNodeOfType(state.schema.nodes['table'])(
          state,
          dispatch,
          view,
        );
      }
      return true;
    }
    return false;
  },
  selectNodeForward,
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
///
/// `undo` and `redo` pc keybindings are overwritten in embedded-controller!

export function pcBaseKeymap(schema: Schema): Record<string, Command>;
/**
 * @deprecated providing the `options` argument to `pcBaseKeymap` is deprecated.
 * The behaviour of `selectBlockRdfaNode` is included by default.
 */
export function pcBaseKeymap(
  schema: Schema,
  options?: KeymapOptions,
): Record<string, Command>;
export function pcBaseKeymap(schema: Schema, options?: KeymapOptions) {
  return {
    'Mod-z': undo,
    'Mod-Z': undo,
    'Mod-y': redo,
    'Mod-Y': redo,
    'Mod-b': toggleMarkAddFirst(schema.marks['strong']),
    'Mod-B': toggleMarkAddFirst(schema.marks['strong']),
    'Mod-i': toggleMarkAddFirst(schema.marks['em']),
    'Mod-I': toggleMarkAddFirst(schema.marks['em']),
    'Mod-u': toggleMarkAddFirst(schema.marks['underline']),
    'Mod-U': toggleMarkAddFirst(schema.marks['underline']),
    Enter: chainCommands(
      splitListItem(schema.nodes['list_item']),
      newlineInCode,
      createParagraphNear,
      liftEmptyBlockChecked,
      splitBlock,
      insertHardBreak,
    ),
    'Shift-Enter': chainCommands(exitCode, insertHardBreak),
    'Mod-Enter': exitCode,
    Backspace: getBackspaceCommand(options),
    'Mod-Backspace': getBackspaceCommand(options),
    'Shift-Backspace': getBackspaceCommand(options),
    Delete: del,
    'Mod-Delete': del,
    'Mod-a': selectAll,
    Tab: sinkListItem(schema.nodes['list_item']),
    'Shift-Tab': liftListItem(schema.nodes['list_item']),
    // Alignment shortcuts
    'Mod-Shift-L': setAlignment({ option: 'left' }),
    'Mod-Shift-E': setAlignment({ option: 'center' }),
    'Mod-Shift-R': setAlignment({ option: 'right' }),
    'Mod-Shift-J': setAlignment({ option: 'justify' }),
  };
}

/// A copy of `pcBaseKeymap` that also binds **Ctrl-h** like Backspace,
/// **Ctrl-d** like Delete, **Alt-Backspace** like Ctrl-Backspace, and
/// **Ctrl-Alt-Backspace**, **Alt-Delete**, and **Alt-d** like
/// Ctrl-Delete.
export function macBaseKeymap(schema: Schema): Record<string, Command>;
/**
 * @deprecated providing the `options` argument to `macBaseKeymap` is deprecated.
 * The behaviour of `selectBlockRdfaNode` is included by default.
 */
export function macBaseKeymap(
  schema: Schema,
  options?: KeymapOptions,
): Record<string, Command>;
export function macBaseKeymap(schema: Schema, options?: KeymapOptions) {
  const pcmap = pcBaseKeymap(schema, options);
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
}

export const embeddedEditorBaseKeymap: Keymap = (schema) => {
  return {
    'Mod-b': toggleMarkAddFirst(schema.marks['strong']),
    'Mod-B': toggleMarkAddFirst(schema.marks['strong']),
    'Mod-i': toggleMarkAddFirst(schema.marks['em']),
    'Mod-I': toggleMarkAddFirst(schema.marks['em']),
    'Mod-u': toggleMarkAddFirst(schema.marks['underline']),
    'Mod-U': toggleMarkAddFirst(schema.marks['underline']),
    Enter: chainCommands(
      newlineInCode,
      createParagraphNear,
      liftEmptyBlock,
      splitBlock,
      insertHardBreak,
    ),
    'Shift-Enter': chainCommands(exitCode, insertHardBreak),
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
export function baseKeymap(schema: Schema): Record<string, Command>;
/**
 * @deprecated providing the `options` argument to `baseKeymap` is deprecated.
 * The behaviour of `selectBlockRdfaNode` is included by default.
 */
export function baseKeymap(
  schema: Schema,
  options?: KeymapOptions,
): Record<string, Command>;
export function baseKeymap(schema: Schema, options?: KeymapOptions) {
  return mac ? macBaseKeymap(schema, options) : pcBaseKeymap(schema, options);
}
