import SayController from '@lblod/ember-rdfa-editor/core/say-controller';

export function generatePageForExport(
  controller: SayController,
  includeStyles: boolean,
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

  const contentDocument = parser.parseFromString(
    controller?.htmlContent || '',
    'text/html',
  );

  if (contentDocument.body.firstChild) {
    basicDocument.body.appendChild(contentDocument.body.firstChild);
  }

  return '<!DOCTYPE html>' + basicDocument.documentElement.outerHTML;
}
