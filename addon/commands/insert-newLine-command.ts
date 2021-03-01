import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelElement from "../model/model-element";
import ModelNode from "../model/model-node";

export default class InsertNewLineCommand extends Command {
  name = "insert-newLine";

  constructor(model: Model) {
    super(model);
  }

  canExecute(selection: ModelSelection = this.model.selection): boolean {
    return true;
  }

  execute(selection: ModelSelection = this.model.selection): void {

    if (!selection.lastRange) {
      throw new Error("no last range");
    }

    const anchor = selection.lastRange.start.path;
    const focus = selection.lastRange.end.path;

    const selectedIterator = selection.findAllInSelection({});

    if (!selectedIterator) {
      throw new Error("couldn't get itterator");
    }

    const selected = Array.from(selectedIterator);

    const firstText = selected.find(e => e.modelNodeType === 'TEXT');
    const lastText = selected.reverse().find(e => e.modelNodeType === 'TEXT');
    const anchorPos = anchor[anchor.length - 1];
    const focusPos = focus[focus.length - 1];

    if (!firstText ||
      !lastText ||
      !ModelNode.isModelText(firstText) ||
      !ModelNode.isModelText(lastText)) {
      throw new Error("couldn't get the first/last texts in selection");
    }

    const firstSplit = firstText.split(anchorPos);
    const lastSplit = lastText.split(focusPos);

    if (!firstSplit || !lastSplit) {
      throw new Error("couldn't split first/last text");
    }

    const br = new ModelElement('br');
    let cursorPos = [0];

    //handle zero length selection
    if (anchor === focus) {
      if (!firstSplit.left.parent) {
        throw new Error("no parent, root element?");
      }
      firstSplit.left.parent.addChild(br, firstSplit.left.index! + 1);
      cursorPos = [...split.right.getIndexPath()];
      cursorPos.push(0);
    }
    //handle long selection of single item
    else if (selected.length === 1) {
      const split = firstText.split(anchorPos);
      split.left.parent.addChild(br, split.left.index + 1);
      const rightSplit = split.right.split(focusPos - split.left.length);
      rightSplit.left.parent.removeChild(rightSplit.left);
      cursorPos = [...rightSplit.right.getIndexPath()];
      cursorPos.push(0);
    }
    //handle multiple selected elems
    else {
      //this should really be moved to a different function
      const firstSplit = firstText.split(anchorPos);
      firstSplit.right.parent.removeChild(firstSplit.right);
      const lastSplit = lastText.split(focusPos);
      lastSplit.left.parent.removeChild(lastSplit.left);

      for (let i = 0; i < selected.length; i++) {
        if (firstSplit.left.findAncestor(node => node === selected[i], false) ||
          lastSplit.right.findAncestor(node => node === selected[i], false) ||
          firstText === selected[i] ||
          lastText === selected[i] ||
          firstSplit.left === selected[i] ||
          firstSplit.right === selected[i]) {
          //do nothing
        } else {
          selected[i].parent?.removeChild(selected[i]);
        }
      }

      const cursorPos = [...lastSplit.right.getIndexPath()];
      cursorPos.push(0);
    }


    selection.anchor.path = cursorPos;
    selection.focus.path = cursorPos;

    this.model.write();
    this.model.readSelection();
    return;
  }
}
