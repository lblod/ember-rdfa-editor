import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelElement from "../model/model-element";
import ModelNode from "../model/model-node";
import {MisbehavedSelectionError, NoParentError} from "@lblod/ember-rdfa-editor/utils/errors";

export default class InsertNewLineCommand extends Command {
  name = "insert-newLine";

  constructor(model: Model) {
    super(model);
  }

  canExecute(selection: ModelSelection = this.model.selection): boolean {
    return true;
  }

  execute(selection: ModelSelection = this.model.selection): void {

    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const selectionStart = selection.lastRange.start;
    const selectionEnd = selection.lastRange.end;
    const startPos = selectionStart.parentOffset;
    const endPos = selectionEnd.parentOffset;

    const selectedIterator = selection.findAllInSelection({});

    if (!selectedIterator) {
      throw new Error("couldn't get iterator");
    }

    const selected = Array.from(selectedIterator);

    // get the first and last textnodes of the selection
    const firstText = selected.find(ModelNode.isModelText);
    const lastText = selected.reverse().find(ModelNode.isModelText);

    if (!firstText || !lastText) {
      throw new Error("couldn't get the first/last texts in selection");
    }

    // split the node at the start of the selection
    const {left: leftOfStart, right: rightOfStart} = firstText.split(startPos);
    // split the node at the end of the selection
    const {left: leftOfEnd, right: rightOfEnd} = lastText.split(endPos);

    const br = new ModelElement('br');
    let cursorPos = [0];

    const leftParent = leftOfStart.parent;

    if (!leftParent) {
      throw new NoParentError();
    }

    //handle zero length selection
    if (selection.isCollapsed) {
      // add the break to the right of the node before the cursor
      leftParent.addChild(br, leftOfStart.index! + 1);

      // set the cursor to be at the start of the node to the right of the split
      cursorPos = [...rightOfStart.getIndexPath()];
      cursorPos.push(0);
    }
    //handle long selection of single item
    else if (selected.length === 1) {
      // add the break to the right of the node before the selection start
      leftParent.addChild(br, leftOfStart.index! + 1);

      // split the node at the end of the selection
      const {left, right} = rightOfStart.split(endPos - leftOfStart.length);

      // remove the middle part
      this.model.removeModelNode(left);

      // leave the cursor at the start of the right part of the split
      cursorPos = [...right.getIndexPath()];
      cursorPos.push(0);
    }
    //handle multiple selected elems
    else {

      //remove inner ends of selection
      this.model.removeModelNode(rightOfStart);
      this.model.removeModelNode(leftOfEnd);

      // loop over selected elements and remove the ones that are not ancestors of the
      // textnodes to the left and right of the selection

      for (const selectedItem of selected) {
        if (!(leftOfStart.findAncestor(node => node === selectedItem, true) ||
          rightOfEnd.findAncestor(node => node === selectedItem, true) ||
          firstText === selectedItem ||
          lastText === selectedItem)) {
          selectedItem.parent?.removeChild(selectedItem);
        }
      }

      // leave the cursor at the start of the right part of the split
      const cursorPos = [...rightOfEnd.getIndexPath()];
      cursorPos.push(0);
    }


    selection.anchor.path = cursorPos;
    selection.focus.path = cursorPos;

    this.model.write();
    this.model.readSelection();
    return;
  }
}
