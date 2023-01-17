import {
  cleanListElements,
  postCleanHtml,
  preCleanHtml,
  cleanEmptyElements,
  cleanLinkElements,
} from '@lblod/ember-rdfa-editor/utils/ce/paste-handler-helper-functions';

const parser = new DOMParser();

export function cleanDocx(html: string): string {
  const document = parser.parseFromString(preCleanHtml(html), 'text/html');
  const { body } = document;

  cleanEmptyElements(body);
  cleanLinkElements(body);
  cleanListElements(body);

  return postCleanHtml(body.innerHTML);
}
