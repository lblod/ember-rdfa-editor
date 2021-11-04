import {InputHandler} from "@lblod/ember-rdfa-editor/editor/input-handlers/input-handler";
import {isKeyDownEvent} from "@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import {HandlerResponse} from "@lblod/ember-rdfa-editor/editor/input-handlers/handler-response";
import {MisbehavedSelectionError, ModelError, ParseError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelRangeUtils from "@lblod/ember-rdfa-editor/model/util/model-range-utils";

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
      // The cursor is located at the start of an element, which means right behind the opening tag.
      // There are 3 cases here:
      //   - The element is an "li".
      //   - The element is a table cell ("th" or "td"). In this case, do nothing (see Google Documents).
      //   - In all other cases, we remove the last character of the first text node we find before
      //     the cursor.
      if (range.start.parentOffset === 0) {
        if (ModelNodeUtils.isListElement(range.start.parent)) {
          this.rawEditor.executeCommand("delete-li-backwards");
        } else if (ModelNodeUtils.isTableCell(range.start.parent)) {
          // DO NOTHING IN CASE OF TABLE
        } else {
          this.backspaceLastTextRelatedNode(range.start);
        }
      // The cursor is located somewhere else in the current node, but not right after the opening tag.
      } else {
        const nodeBefore = range.start.nodeBefore();
        if (!nodeBefore) {
          throw new ModelError("Could not find the node before the given position");
        }

        if (ModelNodeUtils.isTextRelated(nodeBefore)) {
          this.rawEditor.executeCommand("delete-character-backwards");

          // The cursor is located right behind an element, which means right behind its closing tag.
          // There are 3 cases here:
          //   - The element is a list container ("ul" or "ol"). In this case, we search for the last list element
          //     of this list and we place the cursor behind at the end of this list element.
          //   - The element is a "table". In this case, do nothing (see Google Documents).
          //   - In all other cases, we remove the last character of the first text node we find before
          //     the cursor.
        } else if (ModelNode.isModelElement(nodeBefore)) {
          if (ModelNodeUtils.isListContainer(nodeBefore)) {
            this.rawEditor.executeCommand("delete-list-backwards");
          } else if (ModelNodeUtils.isTableContainer(nodeBefore)) {
            // DO NOTHING IN CASE OF TABLE
          } else {
            this.backspaceLastTextRelatedNode(range.start);
          }
        } else {
          throw new ParseError("Unsupported node type");
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
      new ModelRange(newCursorPosition, newCursorPosition)
    );
  }
}
