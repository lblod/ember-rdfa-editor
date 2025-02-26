import { Plugin, PluginKey } from 'prosemirror-state';
import { notificationPluginKey } from '#root/plugins/notification/index.ts';
import type IntlService from 'ember-intl/services/intl';
import type { Notification } from '#root/plugins/notification/index.ts';
import { CircleXIcon } from '@appuniversum/ember-appuniversum/components/icons/circle-x';

export const checkPasteSizeKey = new PluginKey('CHECK_PASTE_SIZE');

export function checkPasteSize({
  pasteLimit = 1000000,
  onLimitReached,
}: {
  pasteLimit?: number;
  onLimitReached?: () => void;
}): Plugin {
  return new Plugin({
    key: checkPasteSizeKey,
    props: {
      handlePaste(view, event) {
        const data = event.clipboardData;
        if (!data) return;
        const dataItems = data.items;
        let totalSize = 0;
        for (const item of dataItems) {
          const file = item.getAsFile();
          if (file) {
            totalSize += file.size;
          }
        }
        if (totalSize > pasteLimit) {
          if (onLimitReached) {
            onLimitReached();
          } else {
            // Show a notification via the notification plugin
            const { notificationCallback, intl } =
              notificationPluginKey.getState(view.state) as {
                notificationCallback: (notification: Notification) => void;
                intl: IntlService;
              };
            notificationCallback({
              title: intl.t(
                'ember-rdfa-editor.notifications.paste-size-limit-reached',
              ),
              options: {
                type: 'error',
                icon: CircleXIcon,
              },
            });
          }

          return true;
        }
        return;
      },
    },
  });
}
