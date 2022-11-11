import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';
import { PropertyState } from '@lblod/ember-rdfa-editor/model/util/types';
import ModelRangeUtils from '@lblod/ember-rdfa-editor/model/util/model-range-utils';
import HTMLInputParser, {
  LIMITED_SAFE_TAGS,
} from '@lblod/ember-rdfa-editor/utils/html-input-parser';
import { MisbehavedSelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { InputHandler } from '@lblod/ember-rdfa-editor/editor/input-handlers/input-handler';
import { HandlerResponse } from '@lblod/ember-rdfa-editor/editor/input-handlers/handler-response';
import {
  createLogger,
  Logger,
} from '@lblod/ember-rdfa-editor/utils/logging-utils';
import { cleanDocx } from '@prezly/docx-cleaner';

export default class PasteHandler extends InputHandler {
  private logger: Logger;

  constructor({ rawEditor }: { rawEditor: RawEditor }) {
    super(rawEditor);
    this.logger = createLogger('PasteHandler');
  }

  isHandlerFor(event: ClipboardEvent): boolean {
    return !!event.clipboardData;
  }

  convertToPlain(rtf: string): string {
    rtf = rtf.replace(/\\par[d]?/g, '');
    return rtf
      .replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:-?\d+)?[ ]?/g, '')
      .trim();
  }

  // see https://www.w3.org/TR/clipboard-apis/#paste-action for more info
  handleEvent(
    event: ClipboardEvent,
    pasteHTML: boolean,
    pasteExtendedHTML: boolean
  ): HandlerResponse {
    const clipboardData = event.clipboardData;
    console.log('*****paste handler******', clipboardData);

    if (!clipboardData) {
      this.logger('No clipboardData object found, ignoring paste.');
      return { allowPropagation: false, allowBrowserDefault: false };
    }

    const isInTable =
      this.rawEditor.selection.inTableState === PropertyState.enabled;
    const canPasteHTML =
      !isInTable &&
      (pasteHTML || pasteExtendedHTML) &&
      this.hasClipboardHtmlContent(clipboardData);

    const range = this.rawEditor.model.selection.lastRange;
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const pasteRange = ModelRangeUtils.getExtendedToPlaceholder(range);
    if (canPasteHTML) {
      try {
        //******** Workaround to make the 'copy-paste of lists' from ms word(desktop version) work *************//

        // const inputParser = pasteExtendedHTML
        //   ? new HTMLInputParser({})
        //   : new HTMLInputParser({ safeTags: LIMITED_SAFE_TAGS });

        const htmlPaste = clipboardData.getData('text/html');
        // const cleanHTML = inputParser.cleanupHTML(htmlPaste);

        // const html = clipboardData.getData('text/html');
        const rtf = clipboardData.getData('text/rtf');
        const cleanHtml = cleanDocx(htmlPaste, rtf);

        // console.log('cleanHtml --->', cleanHTML);
        // console.log('htmlPaste --->', clipboardData.getData('text/rtf'));
        // console.log(
        //   'RTF TO PLAIN *********',
        //   this.convertToPlain(clipboardData.getData('text/rtf'))
        // );

        this.rawEditor.executeCommand('insert-html', cleanHtml, pasteRange);

        // this.rawEditor.executeCommand(
        //   'insert-html',
        //   '<ul><li><span style="font-size:14.0pt">release of Letraset</span></li><li><span style="font-size:14.0pt">release of Letraset</span></li><li><span style="font-size:14.0pt">release of Letraset</span></li><li><span style="font-size:14.0pt">release of Letraset</span></li><li><span style="font-size:14.0pt">release of Letraset</span></li></ul>', pasteRange);
      } catch (error) {
        // Fall back to text pasting.
        console.warn(error); //eslint-disable-line no-console
        const text = this.getClipboardContentAsText(clipboardData);
        this.rawEditor.executeCommand('insert-text', text, pasteRange);
      }
    } else {
      const text = this.getClipboardContentAsText(clipboardData);
      this.rawEditor.executeCommand('insert-text', text, pasteRange);
    }

    this.rawEditor.model.selection.lastRange?.collapse();
    this.rawEditor.model.writeSelection();
    return { allowPropagation: false, allowBrowserDefault: false };
  }

  hasClipboardHtmlContent(clipboardData: DataTransfer): boolean {
    const potentialContent = clipboardData.getData('text/html') || '';
    return potentialContent.length > 0;
  }

  getClipboardContentAsText(clipboardData: DataTransfer): string {
    const text = clipboardData.getData('text/plain') || '';
    if (text.length === 0) {
      return clipboardData.getData('text') || '';
    }

    return text;
  }
}
