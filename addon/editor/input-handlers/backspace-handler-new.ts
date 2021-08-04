import {InputHandler} from "@lblod/ember-rdfa-editor/editor/input-handlers/input-handler";
import {isKeyDownEvent} from "@lblod/ember-rdfa-editor/editor/input-handlers/event-helpers";
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import {HandlerResponse} from "@lblod/ember-rdfa-editor/editor/input-handlers/handler-response";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";
import ModelTreeWalker, {toFilterSkipFalse} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";

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
      //   - The element is an "li". We replace the element by its children, we split the list into two lists
      //     and if there remain lists without any "li" element in them, we also remove these lists.
      //   - The element is a table cell ("th" or "td"). In this case, do nothing (see Google Documents).
      //   - In all other cases, we remove the last character of the first text node we find before
      //     the cursor.
      if (range.start.parentOffset === 0) {
        if (ModelNodeUtils.isListElement(range.start.parent)) {
          // TODO: In list element.
        } else if (!ModelNodeUtils.isTableCell(range.start.parent)) {
          this.backspaceLastTextRelatedNode(range.start);
        } else {
          // DO NOTHING IN CASE OF TABLE
        }
      } else {
        const nodeBefore = range.start.nodeBefore();
        // The cursor is located right behind a text node. In this case, we can safely select the last
        // character of this text node and remove it.
        if (ModelNodeUtils.isTextRelated(nodeBefore)) {
          this.backspaceTextRelatedNode(nodeBefore);
        // The cursor is located right behind an element, which means right behind its closing tag.
        // There are 3 cases here:
        //   - The element is a list container ("ul" or "ol"). In this case, we place the cursor right behind
        //     the first text node in this list.
        //   - The element is a "table". In this case, do nothing (see Google Documents).
        //   - In all other cases, we remove the last character of the first text node we find before
        //     the cursor.
        } else if (ModelNode.isModelElement(nodeBefore)) {
          if (ModelNodeUtils.isListContainer(range.start.parent)) {
            console.log("list container");
            const lastLi = BackspaceHandler.findLastListElement(nodeBefore);
            if (!lastLi) {
              throw new Error("List without any list elements");
            }

            const newPosition = ModelPosition.fromInElement(lastLi, lastLi.getMaxOffset());
            this.rawEditor.model.selectRange(new ModelRange(newPosition));
          } else if (!ModelNodeUtils.isTableCell(range.start.parent)) {
            this.backspaceLastTextRelatedNode(range.start);
          } else {
            // DO NOTHING IN CASE OF TABLE
          }
        } else {
          throw new Error("Unsupported node type");
        }
      }
    } else {
      // If the selection is not collapsed, backspace just has to delete every node in the selection.
      this.rawEditor.executeCommand("delete-selection");
    }

    return {allowPropagation: false, allowBrowserDefault: false};
  }

  private backspaceTextRelatedNode(node: ModelNode | null): void {
    if (!node) {
      return;
    }

    let deleteRange: ModelRange;
    if (ModelNode.isModelText(node)) {
      // Create a new range that selects the last character of the found text node.
      deleteRange = new ModelRange(
        ModelPosition.fromInTextNode(node, node.length - 1),
        ModelPosition.fromInTextNode(node, node.length)
      );
    } else if (ModelNodeUtils.isBr(node)) {
      // Create a new range around the "br" element.
      deleteRange = ModelRange.fromAroundNode(node);
    } else {
      throw new Error("Found node is not text related");
    }

    const modelSelection = new ModelSelection(this.rawEditor.model);
    modelSelection.addRange(deleteRange);

    this.rawEditor.executeCommand("delete-selection", modelSelection);
  }

  private backspaceLastTextRelatedNode(cursorPosition: ModelPosition): void {
    const start = ModelPosition.fromInElement(this.rawEditor.model.rootModelNode, 0);
    const range = new ModelRange(start, cursorPosition);
    const textRelatedNode = BackspaceHandler.findLastTextRelatedNode(range);

    this.backspaceTextRelatedNode(textRelatedNode);
  }

  private static findLastNode(range: ModelRange, predicate: (node: ModelNode) => boolean): ModelNode | null {
    const treeWalker = new ModelTreeWalker({
      filter: toFilterSkipFalse(predicate),
      range: range
    });

    const nodes = [...treeWalker];
    return nodes.length > 0 ? nodes[nodes.length - 1] : null;
  }

  private static findLastTextRelatedNode(range: ModelRange): ModelNode | null {
    return this.findLastNode(range, ModelNodeUtils.isTextRelated);
  }

  private static findLastListElement(list: ModelElement): ModelElement | null {
    const range = ModelRange.fromAroundNode(list);
    const lastLi = this.findLastNode(range, ModelNodeUtils.isListElement);

    if (!lastLi) {
      return null;
    }

    if (!ModelNodeUtils.isListElement(lastLi)) {
      throw new Error("Found node is not a list element");
    }

    return lastLi;
  }
}
