import { cleanEmptyElements } from './cleanEmptyElements.ts';
import { cleanLinkElements } from './cleanLinkElements.ts';
import { cleanListElements } from './cleanListElements.ts';
import { postCleanHtml } from './postCleanHtml.ts';

export function cleanDocx(element: HTMLElement): string {
  cleanEmptyElements(element);
  cleanLinkElements(element);
  cleanListElements(element);

  return postCleanHtml(element.innerHTML);
}
