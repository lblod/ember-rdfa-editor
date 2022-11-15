import { cleanDocx } from '@prezly/docx-cleaner';

export default function pasteHandler(
  rtfPaste: string,
  htmlPaste: string
): string {
  if (!rtfPaste && !htmlPaste) return 'No content found!';

  if (rtfPaste) return cleanDocx(htmlPaste, rtfPaste);

  return htmlPaste;
}
