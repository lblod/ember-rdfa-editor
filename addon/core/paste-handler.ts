import { ProsePlugin, SayView, TextSelection } from '..';
import { cleanDocx } from '../utils/_private/ce/paste-handler-helper-functions';
import HTMLInputParser from '@lblod/ember-rdfa-editor/utils/_private/html-input-parser';
import { preprocessRDFa } from './rdfa-processor';
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

export function pasteHandler(): ProsePlugin {
  return new ProsePlugin({
    props: {
      handlePaste(view: SayView, event) {
        const { clipboardData } = event;
        if (!clipboardData) {
          return;
        }
        const htmlCleaner = new HTMLInputParser({});
        const domParser = new DOMParser();
        if (clipboardData.getData('text/rtf')) {
          event.preventDefault();
          let cleanedHTML = cleanDocx(clipboardData.getData('text/html'));
          cleanedHTML = htmlCleaner.cleanupHTML(cleanedHTML);
          const parsed = domParser.parseFromString(
            cleanedHTML,
            'text/html',
          ).body;
          view.pasteHTML(parsed.outerHTML);
          return true;
        } else {
          // If the clipboard data contains html and is the ouput of an office document,
          // annotate the clipboard data (addition of properties and backlinks) and refresh the whole document.
          const html = clipboardData.getData('text/html');
          if (html) {
            const parsed = domParser.parseFromString(html, 'text/html').body;
            // preprocess RDFa in clipboard content
            preprocessRDFa(parsed);
            view.pasteHTML(parsed.outerHTML);

            // reload document content
            const selection = view.state.selection;
            view.setHtmlContent(view.htmlContent);

            // restore selection
            const newSelection = TextSelection.between(
              view.state.doc.resolve(selection.from),
              view.state.doc.resolve(selection.to),
            );
            view.dispatch(view.state.tr.setSelection(newSelection));
            return true;
          }
          return;
        }
      },
    },
  });
}
