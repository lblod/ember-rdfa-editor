import SayController from '#root/core/say-controller.ts';
import { stripHtmlForPublish } from './strip-html-for-publish.ts';

export function generatePageForExport(
  controller: SayController,
  includeStyles: boolean,
  filterForPublish?: boolean,
) {
  const parser = new DOMParser();
  const basicDocument = parser.parseFromString(
    '<html><head></head><body class="say-content"></body></html>',
    'text/html',
  );

  if (includeStyles) {
    const styleSheets = Array.from(document.styleSheets);
    styleSheets.forEach((styleSheet) => {
      if (styleSheet.href) {
        const linkElement = basicDocument.createElement('link');

        linkElement.rel = 'stylesheet';
        linkElement.href = styleSheet.href;
        linkElement.type = 'text/css';

        basicDocument.head.appendChild(linkElement);
      }
    });
  }

  let content = controller?.htmlContent || '';
  if (filterForPublish) {
    content = stripHtmlForPublish(content);
  }
  const contentDocument = parser.parseFromString(content, 'text/html');

  if (contentDocument.body.firstChild) {
    basicDocument.body.appendChild(contentDocument.body.firstChild);
  }

  return '<!DOCTYPE html>' + basicDocument.documentElement.outerHTML;
}
