import {
  cleanListElements,
  postCleanHtml,
  preCleanHtml,
  cleanEmptyElements,
  cleanLinkElements,
} from '@lblod/ember-rdfa-editor/utils/_private/ce/paste-handler-helper-functions/index';

const parser = new DOMParser();

export function cleanDocx(html: string): string {
  const document = parser.parseFromString(preCleanHtml(html), 'text/html');
  const { body } = document;

  cleanEmptyElements(body);
  cleanLinkElements(body);
  cleanListElements(body);

  return postCleanHtml(body.innerHTML);
}
