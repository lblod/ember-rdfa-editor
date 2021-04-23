import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelSelection from "@lblod/ember-rdfa-editor/model/model-selection";
import ModelNode from "../model/model-node";
import ModelElement from "../model/model-element";
import { MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";


export default class InsertNewLiCommand extends Command {
  name = "insert-newLi";

  constructor(model: Model) {
    super(model);
  }

  canExecute(selection: ModelSelection = this.model.selection): boolean {
    if(selection.isInside(["ul", "ol"])==="enabled"){
      return true;
    }else{
      return false;
    }
  }
  execute(): void {
    const selection = this.model.selection;
    const range = selection.lastRange;
    if (!range) {
      throw new Error("couldn't get range");
    }
    const startPosition = range.start;
    const isCollapsed = selection.isCollapsed;

    if (isCollapsed) {
      this.insertNewLi(startPosition);
    }
    else{
      const collapsedPosition=this.deleteRange(range);
      //this.insertNewLi(collapsedPosition);
    }
    this.model.write();
  }
  deleteRange(range:ModelRange):ModelPosition{
    const startPosition = range.start;
    const endPosition = range.end;

    startPosition.split();
    endPosition.split();

    let startNode=startPosition.nodeAfter();
    let endNode=endPosition.nodeBefore();

    let deleteRight=true;
    let deleteLeft=true;

    let startParentLi;
    let startParentUl;

    let endParentLi;
    let endParentUl;

    if(!startNode){
      startNode=this.findClosestNode(startPosition, "right");
      if(!startNode){
        deleteRight=false;
        startParentLi=startPosition.findAncestors(node=>ModelNode.isModelElement(node) && node.type === "li")[0];
        startParentUl=startParentLi.findAncestor(node=>ModelNode.isModelElement(node) && (node.type === "ul" || node.type === "ol"));
      }
      else{
        startParentLi=startNode.findAncestor(node=>ModelNode.isModelElement(node) && node.type === "li")[0];
        startParentUl=startParentLi.findAncestor(node=>ModelNode.isModelElement(node) && (node.type === "ul" || node.type === "ol"));
      }
    }
    else{
      startParentLi=
      startParentUl=
    }
    if(!endNode){
      endNode=this.findClosestNode(endPosition, "left");
      if(!endNode){
        deleteLeft=false;
      }
      else{

      }
    }
    else{

    }

    if(deleteRight){
      this.deleteInsideLi(startNode, "right");
    }
    if(deleteLeft){
      this.deleteInsideLi(endNode, "left");
    }
    return startPosition;

  }
  deleteInsideLi(startNode, direction){
    let node=startNode;
    const toBeRemoved=[];
    toBeRemoved.push(node);
    while(node){
      if(direction=="left" && node.previousSibling){
        node = node.previousSibling;
        toBeRemoved.push(node);
      }
      else if(direction=="right" && node.nextSibling){
        node = node.nextSibling;
        toBeRemoved.push(node);
      }
      else if(node.parent){
        if (ModelNode.isModelElement(node.parent) && node.parent.type === "li") {
          break;
        }
        node=node.parent;
      }
    }
    toBeRemoved.forEach(node=>{node.remove()});
  }
  findClosestNode(position:ModelPosition, direction:sting){
    let searchVar;
    if(direction=="right"){
      searchVar = position.nodeBefore();
    }
    else if(direction=="left"){
      searchVar = position.nodeAfter();
    }
    else if (searchVar.parent) {
      searchVar = searchVar.parent;
    }

    while (searchVar) {
      if (ModelNode.isModelElement(searchVar) && searchVar.type === "li") {
        break;
      }
      else if (direction=="right" && searchVar.nextSibling) {
        searchVar = searchVar.nextSibling;
        return searchVar;
      }
      else if (direction=="left" && searchVar.previousSibling) {
        searchVar = searchVar.previousSibling;
        return searchVar;
      }
      else if (searchVar.parent) {
        searchVar = searchVar.parent;
      }
    }
    return null;
  }
  // core algorithm
  // this basically splits a li
  // like so:
  //
  // <li>
  //  <div class="some stuff">
  //   some text
  //       ^cursor
  //  </div>
  // </li>
  //
  // turns into:
  //
  // <li>
  //  <div class="some stuff">
  //   some
  //  </div>
  // </li>
  // <li>
  //  <div class="some stuff">
  //   text
  //  ^cursor
  //  </div>
  // </li>
  //
  // when a non-collapsed selection is preset
  // it basically deletes all the highlighted stuff
  // and turns it into a collapsed case
  // if stuff is unclear please ask sergey.andreev@redpencil.io
  insertNewLi(position: ModelPosition): void {

    //split the nodes at position
    position.split();

    //variable initialization
    let parentLi;
    let parentUl;
    let parentLiPos;
    let toBeInserted: ModelNode[] = [];
    let node = position.nodeAfter();

    const newLiNodes = [];
    const newLi = new ModelElement('li');

    //try to find the first node we can copy if there is no nodeAfter
    //looks for a right sibling of a direct ancestor untill we reach the parent li
    if (!node) {
      let searchVar = position.nodeBefore();
      if (searchVar && searchVar.parent) {
        searchVar = searchVar.parent;
      }
      while (searchVar) {
        if (ModelNode.isModelElement(searchVar) && searchVar.type === "li") {
          break;
        }
        else if (searchVar.nextSibling) {
          searchVar = searchVar.nextSibling;
          node = searchVar;
          break;
        }
        else if (searchVar.parent) {
          searchVar = searchVar.parent;
        }
      }

      //assume that the cursor is at the end
      if (!node) {
        node = position.nodeBefore();
        if (!node) {
          throw new Error("couldn't find a node to work with");
        }

        //find parent li and ul/ol as well as parent li position
        parentLi = node.findAncestor(node => ModelNode.isModelElement(node) && (node.type === 'li'), false);
        if (!parentLi) {
          throw new Error("couldn't find the parent li");
        }
        parentUl = parentLi.findAncestor(node => ModelNode.isModelElement(node) && (node.type === 'ul' || node.type === 'ol'), false) as ModelElement;
        if (!parentUl) {
          throw new Error("couldn't find the parent ul/ol");
        }
        parentLiPos = parentLi.index;
        if (!parentLiPos) {
          throw new Error("couldn't find the parent li position");
        }

        //add empty li to the parent ul
        parentUl.addChild(newLi, parentLiPos + 1);
      }
    }
    else {
      //find parent li and ul/ol as well as parent li position
      parentLi = node.findAncestor(node => ModelNode.isModelElement(node) && (node.type === 'li'), false);
      if (!parentLi) {
        throw new Error("couldn't find the parent li");
      }
      parentUl = parentLi.findAncestor(node => ModelNode.isModelElement(node) && (node.type === 'ul' || node.type === 'ol'), false) as ModelElement;
      if (!parentUl) {
        throw new Error("couldn't find the parent ul/ol");
      }
      parentLiPos = parentLi.index;
      if (parentLiPos === null) {
        throw new Error("couldn't find the parent li position");
      }
      newLiNodes.push({ node: node, operation: 'cut' });

      //walk up the nodes and find things to cut/copy to a new li
      while (node) {

        //cut siblings and siblings of parents
        if (node.nextSibling) {
          node = node.nextSibling;
          newLiNodes.push({ node: node, operation: 'cut' });
        }

        //only copy direct parents only
        //and put siblings you cut into them
        //break if we reached the parent li
        else if (node.parent) {
          if (ModelNode.isModelElement(node.parent) && node.parent.type === "li") {
            break;
          }
          node = node.parent;
          newLiNodes.push({ node: node, operation: 'copy' });
        }
        else {
          throw new Error('something went horribly wrong when walking up a tree');
        }
      }

      //update the existing list
      newLiNodes.forEach(e => {
        if (e.operation === 'cut') {
          e.node.remove();
          toBeInserted.push(e.node);
        }
        else if (e.operation === 'copy') {
          //TODO (sergey): replace with shallow clone when thats available
          const copy = e.node.clone() as ModelElement;
          copy.children = [];
          copy.appendChildren(...toBeInserted);
          toBeInserted = [];
          toBeInserted.push(copy);
        }
      });

      newLi.appendChildren(...toBeInserted);
      parentUl.addChild(newLi, parentLiPos + 1);
    }

    //set cursor position
    const newRange = ModelRange.fromInElement(newLi, 0, 0);
    this.model.selection.ranges = [newRange];
    return;
  }
}

