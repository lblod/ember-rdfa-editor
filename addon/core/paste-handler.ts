import { ProseParser, ProsePlugin } from '..';
import { cleanDocx } from '../utils/ce/paste-handler-helper-functions';

export function pasteHandler(): ProsePlugin {
  return new ProsePlugin({
    props: {
      handlePaste(view, event) {
        const { clipboardData } = event;
        if (clipboardData?.getData('text/rtf')) {
          event.preventDefault();
          const cleanedHTML = cleanDocx(clipboardData.getData('text/html'));
          const domParser = new DOMParser();
          const { state } = view;
          const slice = ProseParser.fromSchema(state.schema).parseSlice(
            domParser.parseFromString(cleanedHTML, 'text/html')
          );
          const tr = view.state.tr;
          tr.replaceSelection(slice);
          view.dispatch(tr);
          return true;
        } else {
          return;
        }
      },
    },
  });
}
