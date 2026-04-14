import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { DecorationSet, Decoration } from 'prosemirror-view';
import type IntlService from 'ember-intl/services/intl';
import type { GetContextualActionGroups } from '../contextual-actions';

type PluginState = {
  shouldOpenContextActions: boolean;
  latestState: EditorState | null;
};

export const slashCommandsPluginKey = new PluginKey<PluginState>(
  'SLASH_COMMANDS',
);

function shouldShowPlaceholder(
  state: EditorState,
  getGroups: GetContextualActionGroups,
) {
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

function keepOpenContextActions(state: EditorState) {
  const { parent, parentOffset } = state.selection.$from;
  const textBetween = parent.textBetween(
    parentOffset - 1,
    parentOffset,
    '\0',
    '\0',
  );
  if (textBetween !== '/') {
    return false;
  }

  return true;
}

export function slashCommandsPlugin(options: SlashCommandsPluginArgs) {
  return new Plugin<PluginState>({
    key: slashCommandsPluginKey,
    state: {
      init() {
        return { shouldOpenContextActions: false, latestState: null };
      },
      apply(tr, pluginState, oldState, newState) {
        if (pluginState.shouldOpenContextActions) {
          if (!keepOpenContextActions(newState, tr)) {
            return { ...pluginState, shouldOpenContextActions: false };
          }
        }
        if (!tr.getMeta('SLASH_TYPED')) return { ...pluginState };
        console.log('slash typed');
        if (shouldShowPlaceholder(oldState, options.getGroups)) {
          return { latestState: oldState, shouldOpenContextActions: true };
        }
        return { ...pluginState, shouldOpenContextActions: false };
      },
    },
    props: {
      handleTextInput(view, _from, _to, text) {
        if (text === '/') {
          const tr = view.state.tr.setMeta('SLASH_TYPED', true);
          view.dispatch(tr);
        }
        return false;
      },
      decorations(state: EditorState) {
        const { doc, selection } = state;
        if (!shouldShowPlaceholder(state, options.getGroups)) {
          return null;
        }
        return DecorationSet.create(doc, [
          Decoration.widget(selection.from, () => {
            const el = document.createElement('span');
            el.textContent = options.intl.t(
              'ember-rdfa-editor.contextual-actions.type-/-for-actions',
            );
            el.style.color = '#ccc';
            el.style.caretColor = '#000';
            return el;
          }),
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
