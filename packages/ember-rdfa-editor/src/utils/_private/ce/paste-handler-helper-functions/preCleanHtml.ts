import { cleanCrLf } from './cleanCrLf.ts';
import { removeHtmlSurroundings } from './removeHtmlSurroundings.ts';

const cleaners = [removeHtmlSurroundings, cleanCrLf];

export function preCleanHtml(html: string): string {
  return cleaners.reduce((result, clean) => clean(result), html);
}
