import { ProsePlugin } from '..';
import { cleanDocx } from '../utils/_private/ce/paste-handler-helper-functions';
import HTMLInputParser from '@lblod/ember-rdfa-editor/utils/_private/html-input-parser';
import { EditorView } from 'prosemirror-view';
export const DEFAULT_SAFE_ATTRIBUTES = [
  'colspan',
  'rowspan',
  'title',
  'alt',
  'cellspacing',
  'axis',
  'about',
  'property',
  'datatype',
  'typeof',
  'resource',
  'rel',
  'rev',
  'content',
  'vocab',
  'prefix',
  'href',
  'src',
];

export const DEFAULT_SAFE_TAGS = [
  'a',
  'br',
  'body',
  'code',
  'data',
  'datalist',
  'div',
  'dl',
  'dt',
  'dd',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'img',
  'li',
  'link',
  'meta',
  'nav',
  'ol',
  'p',
  'pre',
  'q',
  's',
  'samp',
  'small',
  'span',
  'strong',
  'sub',
  'sup',
  'table',
  'tbody',
  'td',
  'template',
  'th',
  'thead',
  'time',
  'tr',
  'ul',
  'var',
  'wbr',
  'u',
];
export const DEFAULT_URI_SAFE_ATTRIBUTES = [
  'about',
  'property',
  'datatype',
  'typeof',
  'resource',
  'vocab',
  'prefix',
];

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
        if (clipboardData.getData('text/rtf')) {
          event.preventDefault();

          let cleanedHTML = cleanDocx(clipboardData.getData('text/html'));
          cleanedHTML = cleanHTML(cleanedHTML, view);

          view.pasteHTML(cleanedHTML);
          return true;
        } else {
          const html = clipboardData.getData('text/html');
          if (html) {
            const cleanedHTML = cleanHTML(html, view);
            view.pasteHTML(cleanedHTML);
            return true;
          }
          return;
        }
      },
    },
  });
}
