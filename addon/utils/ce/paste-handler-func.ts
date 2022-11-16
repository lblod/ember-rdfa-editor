import { cleanDocx } from '@prezly/docx-cleaner';
import HTMLInputParser from '@lblod/ember-rdfa-editor/utils/html-input-parser';

export function convertMsWordHtml(
  rtfPaste: string,
  htmlPaste: string,
  inputParser: HTMLInputParser
): string {
  const cleanHtmlFromRTF = cleanDocx(htmlPaste, rtfPaste);
  return inputParser.cleanupHTML(cleanHtmlFromRTF);
}

export function convertGenericHtml(
  htmlPaste: string,
  inputParser: HTMLInputParser
): string {
  return inputParser.cleanupHTML(htmlPaste);
}
