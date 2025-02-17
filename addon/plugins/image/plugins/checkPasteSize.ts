import { Plugin, PluginKey } from 'prosemirror-state';
import { notificationPluginKey } from '@lblod/ember-rdfa-editor/plugins/notification';

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
            notificationPluginKey.getState(view.state).notificationCallback({
              title: 'Paste size limit reached',
              options: {
                type: 'error',
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
