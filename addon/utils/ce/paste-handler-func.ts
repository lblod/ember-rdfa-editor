import HTMLInputParser from '@lblod/ember-rdfa-editor/utils/html-input-parser';
import { cleanDocx } from '@lblod/ember-rdfa-editor/utils/ce/paste-handler-helper-functions';

export function convertMsWordHtml(
  htmlPaste: string,
  inputParser: HTMLInputParser
): string {
  const cleanHtmlFromRTF = cleanDocx(htmlPaste);
  return inputParser.cleanupHTML(cleanHtmlFromRTF);
}

export function convertGenericHtml(
  htmlPaste: string,
  inputParser: HTMLInputParser
): string {
  return inputParser.cleanupHTML(htmlPaste);
}
