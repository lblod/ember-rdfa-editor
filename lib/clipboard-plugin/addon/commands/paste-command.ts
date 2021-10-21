import Command from "@lblod/ember-rdfa-editor/core/command";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import {PropertyState} from "@lblod/ember-rdfa-editor/util/types";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/util/model-range-utils";
import {MutableModel} from "@lblod/ember-rdfa-editor/core/editor-model";
import EditorController from "@lblod/ember-rdfa-editor/core/editor-controller";
import HTMLInputParser, {LIMITED_SAFE_TAGS} from "@lblod/ember-rdfa-editor/util/html-input-parser";

export interface PasteCommandArgs {
  data: DataTransfer;
  range?: ModelRange;
  pasteHTML?: boolean;
  pasteExtendedHTML?: boolean;
}

export default class PasteCommand extends Command<[PasteCommandArgs], void> {
  name = "paste";
  private controller: EditorController;

  constructor(model: MutableModel, controller: EditorController) {
    super(model);
    this.controller = controller;
  }


  execute(source: string, {
    data,
    range = this.model.selection.lastRange!,
    pasteHTML = false,
    pasteExtendedHTML = false
  }: PasteCommandArgs): void {

    const clipboardData = data;

    // TODO this should be handled in the table plugin
    const isInTable = this.model.selection.inTableState === PropertyState.enabled;
    const canPasteHTML = !isInTable && (pasteHTML || pasteExtendedHTML) && this.hasClipboardHtmlContent(clipboardData);


    const pasteRange = ModelRangeUtils.getExtendedToPlaceholder(range);
    if (canPasteHTML) {
      try {
        const inputParser = pasteExtendedHTML
          ? new HTMLInputParser({})
          : new HTMLInputParser({safeTags: LIMITED_SAFE_TAGS});

        const htmlPaste = clipboardData.getData("text/html");
        const cleanHTML = inputParser.cleanupHTML(htmlPaste);

        this.controller.executeCommand("insert-html", cleanHTML, pasteRange);
      } catch (error) {
        // Fall back to text pasting.
        console.warn(error); //eslint-disable-line no-console
        const text = this.getClipboardContentAsText(clipboardData);
        this.controller.executeCommand("insert-text", text, pasteRange);
      }
    } else {
      const text = this.getClipboardContentAsText(clipboardData);
      this.controller.executeCommand("insert-text", text, pasteRange);
    }
    this.model.change(source, () => {
      this.model.selection.lastRange?.collapse();
    });

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
