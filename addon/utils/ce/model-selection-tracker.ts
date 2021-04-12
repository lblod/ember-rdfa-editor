import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import ModelTreeWalker, {FilterResult} from "@lblod/ember-rdfa-editor/model/util/model-tree-walker";
import nodeWalker from "./node-walker";

export default class ModelSelectionTracker {
  model: Model;

  constructor(model: Model) {
    this.model = model;
    this.updateSelection = this.updateSelection.bind(this);
  }

  startTracking() {
    document.addEventListener('selectionchange', this.updateSelection);
  }

  stopTracking() {
    document.removeEventListener('selectionchange', this.updateSelection);
  }

  updateSelection() {
    const currentSelection = getWindowSelection();
    if (!this.model.rootNode.contains(currentSelection.anchorNode) || !this.model.rootNode.contains(currentSelection.focusNode) ||
      (currentSelection.type != 'Caret' && this.model.rootNode === currentSelection.anchorNode && (currentSelection.anchorOffset === currentSelection.focusOffset))) {
      // this.model.selection.clearRanges();
      return;
    }
    this.model.readSelection();
    this.limitTableSelection();

    const modelSelectionUpdatedEvent = new CustomEvent<ModelSelection>(
      'richSelectionUpdated',
      {detail: this.model.selection}
    );
    document.dispatchEvent(modelSelectionUpdatedEvent);
  }

  limitTableSelection(){
    const selection=this.model.selection;
    //check that a selection is inside a table
    if(selection.isInside(["table"])=="enabled"){
      //check if selection spans more than one td/th
      if(selection.isInside(["td", "th"])=="disabled"){
        //find first selected td/th
        const range = selection.lastRange!;
        const treeWalker = new ModelTreeWalker({
          range: range,
        });
        const resultArr = Array.from(treeWalker);
        const firstCell=resultArr.find(node=>ModelNode.isModelElement(node) && (node.type=="td" || node.type=="th"));
        //limit selection to that td/th
        //this is kinda hacky
        range.end.path[range.end.path.length-2]++;
        range.end.path[range.end.path.length-1]=0;
        this.model.writeSelection();
      }
      //console.log('we are in a table');
    }
    //check if there is a table in the selection
    else if(selection.contains(['table'])){
      //check if the table is selected completely

        //select the whole table as well as outside elements
      //else
        //select only the elements outside the table
      //console.log('we are not in a table');
    }
  }
}
