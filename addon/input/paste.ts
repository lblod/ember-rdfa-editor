import Controller from '../model/controller';
import ModelRangeUtils from '../model/util/model-range-utils';
import { PropertyState } from '../model/util/types';
import { MisbehavedSelectionError } from '../utils/errors';
import HTMLInputParser, { LIMITED_SAFE_TAGS } from '../utils/html-input-parser';
import { createLogger } from '../utils/logging-utils';

const logger = createLogger('handlePaste');
export default function handlePaste(
  controller: Controller,
  event: ClipboardEvent,
  pasteHTML?: boolean,
  pasteExtendedHTML?: boolean
) {
  controller.perform((tr) => {
    const clipboardData = event.clipboardData;

    if (!clipboardData) {
      logger('No clipboardData object found, ignoring paste.');
      return;
    }

    const isInTable =
      tr.currentSelection.inTableState === PropertyState.enabled;
    const canPasteHTML =
      !isInTable &&
      (pasteHTML || pasteExtendedHTML) &&
      hasClipboardHtmlContent(clipboardData);

    const range = tr.currentSelection.lastRange;
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const pasteRange = ModelRangeUtils.getExtendedToPlaceholder(range);
    if (canPasteHTML) {
      try {
        const inputParser = pasteExtendedHTML
          ? new HTMLInputParser({})
          : new HTMLInputParser({ safeTags: LIMITED_SAFE_TAGS });

        const htmlPaste = clipboardData.getData('text/html');
        const cleanHTML = inputParser.cleanupHTML(htmlPaste);
        tr.commands.insertHtml({
          htmlString: cleanHTML,
          range: pasteRange,
        });
      } catch (error) {
        // Fall back to text pasting.
        console.warn(error); //eslint-disable-line no-console
        const text = getClipboardContentAsText(clipboardData);
        tr.commands.insertText({ text, range: pasteRange });
      }
    } else {
      const text = getClipboardContentAsText(clipboardData);
      tr.commands.insertText({ text, range: pasteRange });
    }
  });
}

function hasClipboardHtmlContent(clipboardData: DataTransfer): boolean {
  const potentialContent = clipboardData.getData('text/html') || '';
  return potentialContent.length > 0;
}

function getClipboardContentAsText(clipboardData: DataTransfer): string {
  const text = clipboardData.getData('text/plain') || '';
  if (text.length === 0) {
    return clipboardData.getData('text') || '';
  }

  return text;
}
