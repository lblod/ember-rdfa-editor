import { ProsePlugin } from '..';
import { cleanDocx } from '../utils/_private/ce/paste-handler-helper-functions';

export function pasteHandler(): ProsePlugin {
  return new ProsePlugin({
    props: {
      handlePaste(view, event) {
        const { clipboardData } = event;
        if (clipboardData?.getData('text/rtf')) {
          event.preventDefault();
          const cleanedHTML = cleanDocx(clipboardData.getData('text/html'));
          view.pasteHTML(cleanedHTML);
          return true;
        } else {
          return;
        }
      },
    },
  });
}
