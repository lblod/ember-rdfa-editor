import HTMLInputParser from '@lblod/ember-rdfa-editor/utils/_private/html-input-parser';
import { cleanDocx } from '@lblod/ember-rdfa-editor/utils/_private/ce/paste-handler-helper-functions';

export function convertMsWordHtml(
  htmlPaste: string,
  inputParser: HTMLInputParser,
): string {
  const cleanHtmlFromRTF = cleanDocx(htmlPaste);
  return inputParser.prepareHTML(cleanHtmlFromRTF);
}

export function convertGenericHtml(
  htmlPaste: string,
  inputParser: HTMLInputParser,
): string {
  return inputParser.prepareHTML(htmlPaste);
}
