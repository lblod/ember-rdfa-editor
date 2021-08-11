import {InputHandler} from "@lblod/ember-rdfa-editor/editor/input-handlers/input-handler";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import {isKeyDownEvent} from "@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers";
import {HandlerResponse} from "@lblod/ember-rdfa-editor/editor/input-handlers/handler-response";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

export default class DeleteHandler extends InputHandler {
  private readonly response = {allowPropagation: false, allowBrowserDefault: false};

  constructor({rawEditor}: {rawEditor: PernetRawEditor}) {
    super(rawEditor);
  }

  isHandlerFor(event: Event): boolean {
    return isKeyDownEvent(event)
      && event.key === "Delete"
      && !!this.rawEditor.model.selection.lastRange;
  }

  handleEvent(_: KeyboardEvent): HandlerResponse {
    const range = this.rawEditor.model.selection.lastRange;
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    // If range is in lump node, don't do anything.
    if (ModelRangeUtils.isRangeInLumpNode(range)) {
      return this.response;
    }

    if (range.collapsed) {
      const rangeStart = range.start;
      const nodeAfter = rangeStart.nodeAfter();

      if (nodeAfter) {
        // The cursor is located somewhere in the current node, but not right before the closing tag.
        if (ModelNodeUtils.isLumpNode(nodeAfter)) {
          this.rawEditor.executeCommand("delete-lump-node-forwards");
        } else if (ModelNodeUtils.isTextRelated(nodeAfter)) {
          this.rawEditor.executeCommand("delete-character-forwards");
        } else if (ModelNodeUtils.isListContainer(nodeAfter)) {
          this.rawEditor.executeCommand("delete-list-forwards");
        } else if (ModelNodeUtils.isTableContainer(nodeAfter)) {
          // Pressing backspace when the cursor is right in front of a table does nothing.
        } else {

        }
      } else {
        // The cursor is located at the end of an element, which means right in front of the closing tag.
        if (ModelNodeUtils.isListElement(rangeStart.parent)) {
          this.rawEditor.executeCommand("delete-li-forwards");
        } else if (ModelNodeUtils.isTableCell(rangeStart.parent)) {
          // Pressing backspace when the cursor is at the end of a table cell does nothing.
        } else {

        }
      }
    } else {
      // If the selection is not collapsed, delete just has to delete every node in the selection.
      this.rawEditor.executeCommand("delete-selection");
    }

    return this.response;
  }
}
