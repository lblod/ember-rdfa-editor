import {InputHandler} from "@lblod/ember-rdfa-editor/editor/input-handlers/input-handler";
import {isKeyDownEvent} from "@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import {HandlerResponse} from "@lblod/ember-rdfa-editor/editor/input-handlers/handler-response";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

export default class BackspaceHandler extends InputHandler {
  private readonly response = {allowPropagation: false, allowBrowserDefault: false};

  constructor({rawEditor}: {rawEditor: PernetRawEditor}) {
    super(rawEditor);
  }

  isHandlerFor(event: Event): boolean {
    return isKeyDownEvent(event)
      && event.key === "Backspace"
      && !!this.rawEditor.model.selection.lastRange;
  }

  handleEvent(_: KeyboardEvent): HandlerResponse {
    const range = this.rawEditor.model.selection.lastRange;
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    this.doBackspace(range);
    return {allowPropagation: false, allowBrowserDefault: false};
  }

  private doBackspace(range: ModelRange): void {
    // If range is in lump node, don't do anything.
    if (ModelRangeUtils.isRangeInLumpNode(range)) {
      return;
    }

    if (range.collapsed) {
      // const rangeStart = this.handleInvisibleSpaces(range.start);
      const rangeStart = range.start;
      if (rangeStart.sameAs(ModelPosition.fromInElement(this.rawEditor.model.rootModelNode, 0))) {
        return;
      }
      const nodeBefore = rangeStart.nodeBefore();

      if (nodeBefore) {
        // The cursor is located somewhere in the current node, but not right after the opening tag.
        if (ModelNodeUtils.isLumpNode(nodeBefore)) {
          this.rawEditor.executeCommand("delete-lump-node-backwards", range);
        } else if (ModelNodeUtils.isTextRelated(nodeBefore)) {
          this.rawEditor.executeCommand("delete-character-backwards", range);
        } else if (ModelNodeUtils.isListContainer(nodeBefore)) {
          this.rawEditor.executeCommand("delete-list-backwards", range);
        } else if (ModelNodeUtils.isTableContainer(nodeBefore)) {
          // Pressing backspace when the cursor is right behind a table does nothing.
        } else {
          const elementBefore = nodeBefore as ModelElement;
          const newCursor = ModelPosition.fromInNode(elementBefore, elementBefore.getMaxOffset());
          this.doBackspace(new ModelRange(newCursor));
        }
      } else {
        // The cursor is located at the start of an element, which means right behind the opening tag.
        if (ModelNodeUtils.isListElement(rangeStart.parent)) {
          this.rawEditor.executeCommand("delete-li-backwards", range);
        } else if (ModelNodeUtils.isTableCell(rangeStart.parent)) {
          // Pressing backspace when the cursor is at the start of a table cell does nothing.
        } else {
          const newCursor = ModelPosition.fromBeforeNode(rangeStart.parent);
          this.doBackspace(new ModelRange(newCursor));
        }
      }
    } else {
      // If the selection is not collapsed, backspace just has to delete every node in the selection.
      this.rawEditor.executeCommand("delete-selection");
    }
  }

  private backspaceLastTextRelatedNode(cursorPosition: ModelPosition): void {
    const start = ModelPosition.fromInElement(this.rawEditor.model.rootModelNode, 0);
    const range = new ModelRange(start, cursorPosition);

    if (range.start.sameAs(range.end)) {
      return;
    }

    const textRelatedNode = ModelRangeUtils.findLastTextRelatedNode(range);
    if (!textRelatedNode) {
      return;
    }

    const newCursorPosition = ModelPosition.fromAfterNode(textRelatedNode);
    this.rawEditor.executeCommand(
      "delete-character-backwards",
      new ModelRange(newCursorPosition)
    );
  }

  // TODO: How to handle invisible spaces? This looks weird when backspacing multiple newlines.
  private handleInvisibleSpaces(startPosition: ModelPosition) {
    while (startPosition.charactersBefore(1) === INVISIBLE_SPACE) {
      this.rawEditor.executeCommand("delete-character-backwards");
    }

    const resultRange = this.rawEditor.model.selection.lastRange;
    if (!resultRange) {
      throw new MisbehavedSelectionError();
    }

    return resultRange.start;
  }
}
