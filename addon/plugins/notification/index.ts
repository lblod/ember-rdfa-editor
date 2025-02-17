import { Plugin, PluginKey } from 'prosemirror-state';

export const notificationPluginKey = new PluginKey('NOTIFICATION');

export const notificationPlugin = (notificationCallback) => new Plugin({
  key: notificationPluginKey,
  state: {
    init() {
      return {
        notificationCallback: notificationCallback,
      };
    },
    apply(tr, state){
      return state;
    }
  },
});
