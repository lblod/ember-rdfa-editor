import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
import type IntlService from 'ember-intl/services/intl';
import type { GetContextualActionGroups } from '../contextual-actions';
import { ReplaceStep } from 'prosemirror-transform';

export interface PluginState {
  menuOpen: boolean;
  preSlashEditorState: EditorState | null;
  slashPos: number | null;
  searchString: string | null;
  transition: (
    tr: Transaction,
    oldState: EditorState,
    newState: EditorState,
    groups: GetContextualActionGroups,
  ) => PluginState;
}

class IdleState implements PluginState {
  menuOpen = false;
  slashPos = null;
  searchString = null;
  preSlashEditorState: EditorState | null;

  constructor(latestState?: EditorState | null) {
    this.preSlashEditorState = latestState ?? null;
  }

  transition(
    tr: Transaction,
    oldState: EditorState,
    newState: EditorState,
    getGroups: GetContextualActionGroups,
  ): PluginState {
    if (tr.getMeta('SLASH_COMMANDS_PLUGIN') === 'open_context_menu') {
      return new MenuExternallyOpenedState(newState);
    }

    /**
     * If the placeholder was shown in the last state and slash was typed
     * open context actions
     */
    if (
      shouldShowPlaceholder(oldState, getGroups) &&
      transactionIsSlashTyped(tr)
    ) {
      const pos = newState.selection.$from.pos;
      return new SearchingState(oldState, pos, pos, '');
    }
    return new IdleState(newState);
  }
}

class SearchingState implements PluginState {
  menuOpen = true;
  preSlashEditorState: EditorState;
  slashPos: number;
  endPos: number;
  searchString: string;

  constructor(
    preSlashEditorState: EditorState,
    slashPos: number,
    endPos: number,
    searchString: string,
  ) {
    this.preSlashEditorState = preSlashEditorState;
    this.slashPos = slashPos;
    this.endPos = endPos;
    this.searchString = searchString;
  }

  transition(tr: Transaction, _oldState: EditorState, newState: EditorState) {
    if (tr.getMeta('SLASH_COMMANDS_PLUGIN') === 'close_context_menu') {
      return new IdleState(newState);
    }

    const newSlashPos = tr.mapping.map(this.slashPos, -1);
    const newEndPos = tr.mapping.map(this.endPos, 1);

    if (!isValidSearchRange(newState, newSlashPos, newEndPos)) {
      return new IdleState(newState);
    }

    // The cursor must stay within the search range
    const { selection } = newState;
    if (
      !selection.empty ||
      selection.$from.pos < newSlashPos ||
      selection.$from.pos > newEndPos
    ) {
      return new IdleState(newState);
    }

    return new SearchingState(
      this.preSlashEditorState,
      newSlashPos,
      newEndPos,
      getTextBetween(newState, newSlashPos, newEndPos) ?? '',
    );
  }
}

function isValidSearchRange(
  state: EditorState,
  slashPos: number,
  endPos: number,
): boolean {
  if (endPos < slashPos) return false;

  let $slash;
  try {
    $slash = state.doc.resolve(slashPos);
  } catch {
    return false;
  }
  if (!$slash.parent.isTextblock) return false;

  const slashOffset = $slash.parentOffset;
  const charBeforeSlash = $slash.parent.textBetween(
    slashOffset - 1,
    slashOffset,
    '\0',
    '\0',
  );
  if (charBeforeSlash !== '/') return false;

  let $end;
  try {
    $end = state.doc.resolve(endPos);
  } catch {
    return false;
  }

  // Search must stay in same block
  if ($end.parent !== $slash.parent) return false;

  return true;
}

function getTextBetween(
  state: EditorState,
  slashPos: number,
  endPos: number,
): string | null {
  if (!isValidSearchRange(state, slashPos, endPos)) return null;
  const $slash = state.doc.resolve(slashPos);
  const $end = state.doc.resolve(endPos);
  return $slash.parent.textBetween(
    $slash.parentOffset,
    $end.parentOffset,
    '\0',
    '\0',
  );
}

/*
 * This is needed because we need to be able to hide the placeholder
 * when the menu is opened externally (e.g. via the floating plus button)
 */
class MenuExternallyOpenedState implements PluginState {
  menuOpen = true;
  slashPos = null;
  preSlashEditorState: EditorState;
  searchString = null;

  constructor(preSlashEditorState: EditorState) {
    this.preSlashEditorState = preSlashEditorState;
  }

  transition(_tr: Transaction, _oldState: EditorState, newState: EditorState) {
    return new IdleState(newState);
  }
}

export function slashCommandsStateChanged(
  oldState?: PluginState,
  newState?: PluginState,
) {
  return (
    oldState?.menuOpen !== newState?.menuOpen ||
    oldState?.slashPos !== newState?.slashPos ||
    oldState?.preSlashEditorState !== newState?.preSlashEditorState ||
    oldState?.searchString !== newState?.searchString ||
    oldState?.constructor.name !== newState?.constructor.name
  );
}

export const slashCommandsPluginKey = new PluginKey<PluginState>(
  'SLASH_COMMANDS_PLUGIN',
);

function shouldShowPlaceholder(
  state: EditorState,
  getGroups: GetContextualActionGroups,
) {
  const pluginState = getSlashCommandsPluginState(state);
  if (pluginState?.menuOpen) return false;

  const groups = getGroups.flatMap((getGroups) => getGroups(state));
  if (groups.length === 0) return false;
  const { selection } = state;
  // Should be a single cursor
  if (!selection.empty) return false;

  const $from = selection.$from;
  const { parent, parentOffset } = $from;
  if (!parent.isTextblock) return false;

  const isInEmptyParagraph = parent.content.size === 0;
  const isAtStartOfParagraph = parentOffset === 0;
  const afterSelectionIsHardBreak =
    parent.childAfter(parentOffset).node?.type.name === 'hard_break';
  const beforeSelectionIsHardBreak =
    parent.childBefore(parentOffset).node?.type.name === 'hard_break';

  const isAtStartOfEmptyLine =
    isInEmptyParagraph ||
    (isAtStartOfParagraph && afterSelectionIsHardBreak) ||
    (beforeSelectionIsHardBreak && afterSelectionIsHardBreak) ||
    (beforeSelectionIsHardBreak && parentOffset === parent.content.size);

  if (!isAtStartOfEmptyLine) {
    return false;
  }

  return true;
}

interface SlashCommandsPluginArgs {
  intl: IntlService;
  getGroups: GetContextualActionGroups;
}

function activeIsRightAligned(state: EditorState) {
  const parent = state.selection.$from.parent;
  if (!parent) return false;
  return parent.attrs['alignment'] === 'right';
}

function transactionIsCharacterTyped(tr: Transaction, character: string) {
  if (tr.steps.length !== 1) return false;
  const [step] = tr.steps;
  if (!(step instanceof ReplaceStep)) return false;
  const slice = step.slice;
  return (
    slice.content.childCount === 1 &&
    slice.content.firstChild?.isText &&
    slice.content.firstChild.text === character
  );
}

function transactionIsSlashTyped(tr: Transaction) {
  return transactionIsCharacterTyped(tr, '/');
}

export function slashCommandsPlugin(options: SlashCommandsPluginArgs) {
  return new Plugin<PluginState>({
    key: slashCommandsPluginKey,
    state: {
      init() {
        return new IdleState();
      },
      apply(tr, pluginState, oldState, newState) {
        return pluginState.transition(
          tr,
          oldState,
          newState,
          options.getGroups,
        );
      },
    },
    props: {
      decorations(state: EditorState) {
        const { doc, selection } = state;
        if (!shouldShowPlaceholder(state, options.getGroups)) {
          return null;
        }
        return DecorationSet.create(doc, [
          Decoration.widget(
            selection.from,
            () => {
              const el = document.createElement('span');
              el.textContent = options.intl.t(
                'ember-rdfa-editor.contextual-actions.type-/-for-actions',
              );
              el.style.color = 'rgb(161, 158, 153)';
              el.style.caretColor = '#000';
              return el;
            },
            { side: activeIsRightAligned(state) ? -1 : 1 },
          ),
        ]);
      },
    },
  });
}

export function getSlashCommandsPluginState(
  state: EditorState,
): PluginState | undefined {
  return slashCommandsPluginKey.getState(state);
}
