import { Plugin, PluginKey } from 'prosemirror-state';

export interface Notification {
  title?: string;
  message?: string;
  options: {
    type?: 'info' | 'success' | 'warning' | 'error'; // Default depends on the used display method
    icon?: string; // Any valid Appuniversum icon name, default depends on the used display method
    timeOut?: number; // delay in milliseconds after which the toast auto-closes
    closable?: boolean; // Can the toast be closed by users, defaults to `true`
  };
}

export const notificationPluginKey = new PluginKey('NOTIFICATION');

export const notificationPlugin = (
  notificationCallback: (notification: Notification) => void,
) =>
  new Plugin({
    key: notificationPluginKey,
    state: {
      init() {
        return {
          notificationCallback: notificationCallback,
        };
      },
      apply(tr, state) {
        return state;
      },
    },
  });
