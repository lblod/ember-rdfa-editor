import { Plugin, PluginKey } from 'prosemirror-state';

export type State = {
  lastKeyPressed: null | string;
};

export const lastKeyPressedPluginKey = new PluginKey<State>(
  'LAST_KEY_PRESSED_PLUGIN'
);

export const lastKeyPressedPlugin = new Plugin<State>({
  key: lastKeyPressedPluginKey,
  state: {
    init() {
      return {
        lastKeyPressed: null,
      };
    },
    apply(tr, value) {
      const latestKey: unknown = tr.getMeta('latestKey');

      if (typeof latestKey === 'string') {
        return {
          lastKeyPressed: latestKey,
        };
      }

      return value;
    },
  },
  props: {
    handleKeyDown(view, event) {
      view.dispatch(view.state.tr.setMeta('latestKey', event.key));

      return false;
    },
  },
});
