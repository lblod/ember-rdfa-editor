import type IntlService from 'ember-intl/services/intl';
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

interface notificationOptions {
  notificationCallback: (notification: Notification) => void,
  intl: IntlService
}

export const notificationPlugin = (options : notificationOptions) =>
  new Plugin({
    key: notificationPluginKey,
    state: {
      init() {
        return {
          notificationCallback: options.notificationCallback,
          intl: options.intl
        };
      },
      apply(tr, state) {
        return state;
      },
    },
  });
