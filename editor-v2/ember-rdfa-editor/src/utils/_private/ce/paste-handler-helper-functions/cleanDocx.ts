import {
  cleanListElements,
  postCleanHtml,
  cleanEmptyElements,
  cleanLinkElements,
} from '#root/utils/_private/ce/paste-handler-helper-functions/index';

export function cleanDocx(element: HTMLElement): string {
  cleanEmptyElements(element);
  cleanLinkElements(element);
  cleanListElements(element);

  return postCleanHtml(element.innerHTML);
}
