import { ProsePlugin } from '@lblod/ember-rdfa-editor';
import { PluginKey } from 'prosemirror-state';
export const localePluginKey = new PluginKey<LocalePluginState>(
  'LOCALE_PLUGIN'
);

interface LocalePluginState {
  locale: string;
}

export function locale({
  locale,
}: LocalePluginState): ProsePlugin<LocalePluginState> {
  return new ProsePlugin<LocalePluginState>({
    key: localePluginKey,
    state: {
      init() {
        return {
          locale,
        };
      },
      apply() {
        return {
          locale,
        };
      },
    },
  });
}
