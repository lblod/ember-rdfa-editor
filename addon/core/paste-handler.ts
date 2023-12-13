import { EditorView } from 'prosemirror-view';
import HTMLInputParser from '@lblod/ember-rdfa-editor/utils/_private/html-input-parser';

import { ProsePlugin } from '..';

const cleanHTML = (html: string, view: EditorView): string => {
  const htmlCleaner = new HTMLInputParser({ editorView: view });

  return htmlCleaner.prepareHTML(html);
};

export function pasteHandler(): ProsePlugin {
  return new ProsePlugin({
    props: {
      handlePaste(view, event) {
        const { clipboardData } = event;

        if (!clipboardData) {
          return;
        }

        const html = clipboardData.getData('text/html');

        view.pasteHTML(cleanHTML(html, view));

        return true;
      },
    },
  });
}
