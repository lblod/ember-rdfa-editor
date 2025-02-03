import { Plugin, PluginKey } from 'prosemirror-state';

export const checkPasteSizeKey = new PluginKey('CHECK_PASTE_SIZE');

export function checkPasteSize({
  pasteLimit = 100000,
  onLimitReached,
}: {
  pasteLimit?: number;
  onLimitReached?: () => void;
}): Plugin {
  return new Plugin({
    key: checkPasteSizeKey,
    props: {
      handlePaste(_, event) {
        const data = event.clipboardData;
        if (!data) return;
        const dataItems = data.items;
        let totalSize = 0;
        for (let item of dataItems) {
          const file = item.getAsFile();
          if (file) {
            totalSize += file.size;
          }
        }
        if (totalSize > pasteLimit) {
          if (onLimitReached) {
            onLimitReached();
          } else {
            console.error('Paste size is bigger than expected');
          }

          return true;
        }
        return;
      },
    },
  });
}
