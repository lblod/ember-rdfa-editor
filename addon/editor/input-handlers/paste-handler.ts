import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import {PropertyState} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import HTMLInputParser, {LIMITED_SAFE_TAGS} from "@lblod/ember-rdfa-editor/utils/html-input-parser";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {taskFor} from "ember-concurrency-ts";
import {InputHandler} from "@lblod/ember-rdfa-editor/editor/input-handlers/input-handler";
import {HandlerResponse} from "@lblod/ember-rdfa-editor/editor/input-handlers/handler-response";
import {createLogger} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import {Diary} from "diary";

export default class PasteHandler extends InputHandler {
  private logger: Diary;

  constructor({rawEditor}: {rawEditor: PernetRawEditor}) {
    super(rawEditor);
    this.logger = createLogger("PasteHandler");
  }

  // see https://www.w3.org/TR/clipboard-apis/#paste-action for more info
  handleEvent(event: ClipboardEvent, pasteHTML: boolean, pasteExtendedHTML: boolean): HandlerResponse {
    const clipboardData = event.clipboardData;

    if (!clipboardData) {
      this.logger.warn("No clipboardData object found, ignoring paste.");
      return {allowPropagation: false, allowBrowserDefault: false};
    }

    const isInTable = this.rawEditor.selection.inTableState === PropertyState.enabled;
    const canPasteHTML = !isInTable && (pasteHTML || pasteExtendedHTML) && this.hasClipboardHtmlContent(clipboardData);

    const range = this.rawEditor.model.selection.lastRange;
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const pasteRange = ModelRangeUtils.getExtendedToPlaceholder(range);
    if (canPasteHTML) {
      try {
        const inputParser = pasteExtendedHTML
          ? new HTMLInputParser({})
          : new HTMLInputParser({safeTags: LIMITED_SAFE_TAGS});

        const htmlPaste = clipboardData.getData( "text/html");
        const cleanHTML = inputParser.cleanupHTML(htmlPaste);

        this.rawEditor.executeCommand("insert-html", cleanHTML, pasteRange);
      } catch (error) {
        // Fall back to text pasting.
        console.warn(error); //eslint-disable-line no-console
        const text = this.getClipboardContentAsText(clipboardData);
        this.rawEditor.executeCommand("insert-text", text, pasteRange);
      }
    } else {
      const text = this.getClipboardContentAsText(clipboardData);
      this.rawEditor.executeCommand("insert-text", text, pasteRange);
    }

    this.rawEditor.selection.lastRange?.collapse();
    this.rawEditor.model.writeSelection();

    this.rawEditor.updateSelectionAfterComplexInput();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    void taskFor(this.rawEditor.generateDiffEvents).perform();

    return {allowPropagation: false, allowBrowserDefault: false};
  }

  isHandlerFor(event: ClipboardEvent): boolean {
    return !!event.clipboardData;
  }

  hasClipboardHtmlContent(clipboardData: DataTransfer): boolean {
    const potentialContent = clipboardData.getData("text/html") || "";
    return potentialContent.length > 0;
  }

  getClipboardContentAsText(clipboardData: DataTransfer): string {
    const text = clipboardData.getData("text/plain") || "";
    if (text.length === 0) {
      return clipboardData.getData("text") || "";
    }

    return text;
  }
}
