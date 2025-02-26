import type { TemplateOnlyComponent } from '@ember/component/template-only';
import type IntlService from 'ember-intl/services/intl';
import { Plugin, PluginKey } from 'prosemirror-state';

export interface Notification {
  title?: string;
  message?: string;
  options: NotificationOptions;
}

export interface NotificationOptions {
  type?: 'info' | 'success' | 'warning' | 'error'; // Default depends on the used display method
  icon?: TemplateOnlyComponent; // Any valid Appuniversum icon imported, default doesn't work on embeddable
  timeOut?: number; // delay in milliseconds after which the toast auto-closes
  closable?: boolean; // Can the toast be closed by users, defaults to `true`
}

export const notificationPluginKey = new PluginKey('NOTIFICATION');

interface notificationOptions {
  notificationCallback: (notification: Notification) => void;
  intl: IntlService;
}

export const notificationPlugin = (options: notificationOptions) =>
  new Plugin({
    key: notificationPluginKey,
    state: {
      init() {
        return {
          notificationCallback: options.notificationCallback,
          intl: options.intl,
        };
      },
      apply(tr, state) {
        return state;
      },
    },
  });
