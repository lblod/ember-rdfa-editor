import {InputHandler} from "@lblod/ember-rdfa-editor/editor/input-handlers/input-handler";
import {isKeyDownEvent} from "@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import {HandlerResponse} from "@lblod/ember-rdfa-editor/editor/input-handlers/handler-response";
import {MisbehavedSelectionError, ParseError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";

export default class BackspaceHandler extends InputHandler {
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

    if (range.collapsed) {
      const rangeStart = this.handleInvisibleSpaces(range.start);
      const nodeBefore = rangeStart.nodeBefore();

      // The cursor is located somewhere in the current node, but not right after the opening tag.
      if (nodeBefore) {
        if (ModelNodeUtils.isTextRelated(nodeBefore)) {
          this.rawEditor.executeCommand("delete-character-backwards");
        } else if (ModelNode.isModelElement(nodeBefore)) {
          if (ModelNodeUtils.isListContainer(nodeBefore)) {
            this.rawEditor.executeCommand("delete-list-backwards");
          } else if (ModelNodeUtils.isTableContainer(nodeBefore)) {
            // DO NOTHING IN CASE OF TABLE
          } else {
            this.backspaceLastTextRelatedNode(rangeStart);
          }
        } else {
          throw new ParseError("Unsupported node type");
        }
      } else {
        // The cursor is located at the start of an element, which means right behind the opening tag.
        if (ModelNodeUtils.isListElement(rangeStart.parent)) {
          this.rawEditor.executeCommand("delete-li-backwards");
        } else if (ModelNodeUtils.isTableCell(rangeStart.parent)) {
          // DO NOTHING IN CASE OF TABLE
        } else {
          this.backspaceLastTextRelatedNode(rangeStart);
        }
      }
    } else {
      // If the selection is not collapsed, backspace just has to delete every node in the selection.
      this.rawEditor.executeCommand("delete-selection");
    }

    return {allowPropagation: false, allowBrowserDefault: false};
  }

  private backspaceLastTextRelatedNode(cursorPosition: ModelPosition): void {
    const start = ModelPosition.fromInElement(this.rawEditor.model.rootModelNode, 0);
    const range = new ModelRange(start, cursorPosition);

    if (range.start.parentOffset === range.end.parentOffset) {
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
