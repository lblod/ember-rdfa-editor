import { EditorState, Plugin, PluginKey, Transaction } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
import type IntlService from 'ember-intl/services/intl';
import type { GetContextualActionGroups } from '../contextual-actions';
import { ReplaceStep } from 'prosemirror-transform';

export interface PluginState {
  menuOpen: boolean;
  latestEditorState: EditorState | null;
  slashPos: number | null;
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
  latestEditorState: EditorState | null;

  constructor(latestState?: EditorState | null) {
    this.latestEditorState = latestState ?? null;
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
      return new SearchingState(oldState, newState.selection.$from.pos);
    }
    return new IdleState(newState);
  }
}

class SearchingState implements PluginState {
  menuOpen = true;
  slashPos: number;
  latestEditorState: EditorState;

  constructor(latestState: EditorState, slashPos: number) {
    this.slashPos = slashPos;
    this.latestEditorState = latestState;
  }

  transition(tr: Transaction, _oldState: EditorState, newState: EditorState) {
    if (keepOpenContextActions(newState, tr, this.slashPos)) {
      return new SearchingState(this.latestEditorState, this.slashPos);
    }

    return new IdleState(newState);
  }
}

/*
 * This is needed because we need to be able to hide the placeholder
 * when the menu is opened externally
 */
class MenuExternallyOpenedState implements PluginState {
  menuOpen = true;
  slashPos = null;
  latestEditorState: EditorState;

  constructor(latestState: EditorState) {
    this.latestEditorState = latestState;
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
    oldState?.latestEditorState !== newState?.latestEditorState ||
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

function keepOpenContextActions(
  state: EditorState,
  tr: Transaction,
  slashPos: number | null,
) {
  if (tr.getMeta('SLASH_COMMANDS_PLUGIN') === 'close_context_menu') {
    return false;
  }
  if (slashPos === null) return false;

  const { pos } = state.selection.$from;
  if (pos !== slashPos) return false;

  const $slash = state.doc.resolve(slashPos);
  const { parent, parentOffset } = $slash;
  const textBetween = parent.textBetween(
    parentOffset - 1,
    parentOffset,
    '\0',
    '\0',
  );
  if (textBetween !== '/') return false;

  return true;
}

function activeIsRightAligned(state: EditorState) {
  const parent = state.selection.$from.parent;
  if (!parent) return false;
  return parent.attrs['alignment'] === 'right';
}

function transactionIsSlashTyped(tr: Transaction) {
  if (tr.steps.length !== 1) return false;
  const [step] = tr.steps;
  if (!(step instanceof ReplaceStep)) return false;
  const slice = step.slice;
  return (
    slice.content.childCount === 1 &&
    slice.content.firstChild?.isText &&
    slice.content.firstChild.text === '/'
  );
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
