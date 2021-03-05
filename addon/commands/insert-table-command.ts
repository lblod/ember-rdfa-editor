import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelTable from "@lblod/ember-rdfa-editor/model/model-table";
import ModelElement from "../model/model-element";
import ModelNode from "../model/model-node";
import {MisbehavedSelectionError, NoParentError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {INVISIBLE_SPACE} from "../model/util/constants";


export default class InsertTableCommand extends Command {
  name = "insert-table";

  constructor(model: Model) {
    super(model);
  }

  canExecute(_selection: ModelSelection = this.model.selection): boolean {
    return true;
  }

  execute(): void {

    const selection= this.model.selection;
    if (!ModelSelection.isWellBehaved(selection)) {
      throw new MisbehavedSelectionError();
    }

    const selectionStart = selection.lastRange.start;
    const selectionEnd = selection.lastRange.end;
    const startPos = selectionStart.parentOffset;
    const endPos = selectionEnd.parentOffset;

    const selectedIterator = selection.findAllInSelection({});

    if (!selectedIterator) {
      // should be impossible
      throw new SelectionError("couldn't get iterator");
    }

    const selected = Array.from(selectedIterator);

    // get the first and last textnodes of the selection
    const firstText = selected.find(ModelNode.isModelText);
    const lastText = selected.reverse().find(ModelNode.isModelText);

    if (!firstText || !lastText) {
      throw new SelectionError("No text nodes in selection");
    }

    // split the node at the start of the selection
    const {left: leftOfStart, right: rightOfStart} = firstText.split(startPos);
    // split the node at the end of the selection
    const {left: leftOfEnd, right: rightOfEnd} = lastText.split(endPos);

    const leftParent = leftOfStart.parent;
    if (!leftParent) {
      throw new NoParentError();
    }

    const table = new ModelTable(2,2);
    


    //handle zero length selection
    if (selection.isCollapsed) {
      // add the break to the right of the node before the cursor
      leftParent.addChild(table, leftOfStart.index! + 1);

      if (rightOfStart.length === 0) {
        rightOfStart.content=INVISIBLE_SPACE;
      }

      selection.collapseOn(rightOfStart);
    }
    //handle long selection of single item
    else if (selected.length === 1) {
      // add the break to the right of the node before the selection start
      leftParent.addChild(table, leftOfStart.index! + 1);

      // split the node at the end of the selection
      const {left, right} = rightOfStart.split(endPos - leftOfStart.length);
      // remove the middle part
      this.model.removeModelNode(left);
      selection.collapseOn(right);
    }
    //handle multiple selected elements
    else {

      leftParent.addChild(table, leftOfStart.index! + 1);
      //remove inner ends of selection
      this.model.removeModelNode(rightOfStart);
      this.model.removeModelNode(leftOfEnd);

      // loop over selected elements and remove the ones that are not ancestors of the
      // textnodes to the left and right of the selection
      for (const selectedItem of selected) {
        if (selectedItem !== firstText && selectedItem !== lastText) {
          //TODO: this query or its inverse should become a method on a modelnode
          if (!leftOfStart.findAncestor(node => node === selectedItem, true) &&
            !rightOfEnd.findAncestor(node => node === selectedItem, true)) {
            this.model.removeModelNode(selectedItem);
          }
        }
      }
      selection.collapseOn(rightOfEnd);
    }


    this.model.write();
  }
  buildTable(rows: Number, columns: Number) {
    const firstRow = new ModelElement('tr');
    for(let i = 0; i< columns; i++) {
      const th = new ModelElement('th');
      firstRow.addChild(th);
    }
    const thead = new ModelElement('thead');
    thead.addChild(firstRow);
    const table = new ModelElement('table');
    table.addChild(thead);
    if(rows > 1) {
      const tbody = new ModelElement('tbody');
      for(let i = 1; i < rows; i++) {
        const row = new ModelElement('tr');
        for(let j = 0; j < columns; j++) {
          const td = new ModelElement('td');
          row.addChild(td);
        }
        tbody.addChild(row);
      }
      table.addChild(tbody);
    }
    return table;
  }
}
