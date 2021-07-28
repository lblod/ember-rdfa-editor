import Command from "./command";
import Model from "@lblod/ember-rdfa-editor/model/model";
import ModelNode from "../model/model-node";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {elementHasType} from "@lblod/ember-rdfa-editor/model/util/predicate-utils";
import {logExecute} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import {MisbehavedSelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ImmediateModelMutator from "@lblod/ember-rdfa-editor/model/mutators/immediate-model-mutator";

export default class InsertNewLiCommand extends Command {
  name = "insert-newLi";

  constructor(model: Model) {
    super(model);
  }

  canExecute(range: ModelRange | null = this.model.selection.lastRange): boolean {
    if (!range) {
      return false;
    }

    return range.hasCommonAncestorWhere(elementHasType("ul", "ol"));
  }

  @logExecute
  execute(range: ModelRange | null = this.model.selection.lastRange): void {
    if (!range) {
      throw new MisbehavedSelectionError();
    }

    const isLi = (node: ModelNode) => ModelNode.isModelElement(node) && node.type === "li";
    const startParentLi = range.start.findAncestors(isLi)[0];
    const endParentLi = range.end.findAncestors(isLi)[0];

    if (!startParentLi || !endParentLi) {
      throw new Error("Couldn't locate parent lis.");
    }

    this.model.change(mutator => {
      // Collapsed selection case
      if (range.collapsed) {
        this.insertLi(mutator, range.start);
      }
      // Single li expanded selection case
      else if (startParentLi === endParentLi) {
        mutator.insertNodes(range);
        this.insertLi(mutator, range.start);
      }
      // Multiple lis selected case
      else {
        const newRange = mutator.insertNodes(range);
        this.model.selectRange(newRange);
      }
    });
  }

  insertLi(mutator: ImmediateModelMutator, position: ModelPosition) {
    const newPosition = mutator.splitUntil(position, elementHasType("ul", "ol"), true);
    const liNode = newPosition.nodeAfter();

    if (!liNode || !ModelNode.isModelElement(liNode) || !elementHasType("li")) {
      throw new Error("Node right after the cursor is not an li.");
    }

    this.model.selectRange(ModelRange.fromInElement(liNode, 0, 0));
  }

  // deleteRange(range: ModelRange) {
  //   const startPosition = range.start;
  //   const endPosition = range.end;
  //
  //   startPosition.split();
  //   endPosition.split();
  //
  //   const startParentLi = startPosition.findAncestors(node => ModelNode.isModelElement(node) && node.type === "li")[0];
  //   const startParentUl = startParentLi.parent;
  //
  //   const endParentLi = endPosition.findAncestors(node => ModelNode.isModelElement(node) && node.type === "li")[0];
  //   const endParentUl = endParentLi.parent;
  //
  //   const maximizedRange = range.getMaximizedRange();
  //   const walker = new ModelTreeWalker({ range: maximizedRange, descend: false });
  //   const selected = Array.from(walker);
  //
  //   let startNode = startPosition.nodeAfter();
  //   let endNode = endPosition.nodeBefore();
  //
  //   let deleteRight = true;
  //   let deleteLeft = true;
  //
  //   //get closest nodes that can be deleted if nodeBefore/After returns nothing
  //   // <li>
  //   //   <div1>     <div2>
  //   //     <text1>    <text2>
  //   //            ^cursor
  //   //here nodeAfter will return nothing but we still need to delete the next div
  //   if (!startNode) {
  //     startNode = this.findClosestNode(startPosition, "right");
  //     if (!startNode) {
  //       deleteRight = false;
  //     }
  //   }
  //
  //   if (!endNode) {
  //     endNode = this.findClosestNode(endPosition, "left");
  //     if (!endNode) {
  //       deleteLeft = false;
  //     }
  //   }
  //   if (!startNode || !endNode) {
  //     throw new Error("couldn't get start or end node");
  //   }
  //   if (deleteRight) {
  //     this.deleteInsideLi(startNode, "right");
  //   }
  //   if (deleteLeft) {
  //     this.deleteInsideLi(endNode, "left");
  //   }
  //
  //   //deletes stuff inbetween
  //   selected.forEach(node => {
  //     if (
  //       node != startParentUl &&
  //       node.findAncestor(node => ModelNode.isModelElement(node) && (node.type === "li"), true) != startParentLi &&
  //       node != endParentUl &&
  //       node.findAncestor(node => ModelNode.isModelElement(node) && (node.type === "li"), true) != endParentLi
  //     ) {
  //       node.remove();
  //     }
  //   });
  //
  //   //set cursor position
  //   const newRange = ModelRange.fromInElement(endParentLi, 0, 0);
  //   this.model.selection.selectRange(newRange);
  //   return;
  // }

  // // Deletes things inside the li before deleting stuff in between.
  // deleteInsideLi(startNode: ModelNode, direction: string) {
  //   let node = startNode;
  //   const toBeRemoved = [];
  //   toBeRemoved.push(node);
  //   while (node) {
  //     if (direction === "left" && node.previousSibling) {
  //       node = node.previousSibling;
  //       toBeRemoved.push(node);
  //     }
  //     else if (direction === "right" && node.nextSibling) {
  //       node = node.nextSibling;
  //       toBeRemoved.push(node);
  //     }
  //     else if (node.parent) {
  //       if (ModelNode.isModelElement(node.parent) && node.parent.type === "li") {
  //         break;
  //       }
  //       node = node.parent;
  //     }
  //   }
  //   toBeRemoved.forEach(node => { node.remove(); });
  // }

  // This function finds the first node to delete if position.nodeAfter/position.nodeBefore
  // don't return anything useful (ie: at the end of a child element).
  // This will look for the first sibling of a parent.
//   findClosestNode(position: ModelPosition, direction: string): ModelNode | null {
//     let searchVar: ModelNode = position.parent;
//
//     while (searchVar) {
//       if (ModelNode.isModelElement(searchVar) && searchVar.type === "li") {
//         break;
//       }
//       else if (direction === "right" && searchVar.nextSibling) {
//         return searchVar.nextSibling;
//       }
//       else if (direction === "left" && searchVar.previousSibling) {
//         return searchVar.previousSibling;
//       }
//       else if (searchVar.parent) {
//         searchVar = searchVar.parent;
//       }
//     }
//
//     return null;
//   }
//
//   // Core algorithm
//   // This basically splits an li, like so:
//   //
//   // <li>
//   //  <div class="some stuff">
//   //   some text
//   //       ^cursor
//   //  </div>
//   // </li>
//   //
//   // turns into:
//   //
//   // <li>
//   //  <div class="some stuff">
//   //   some
//   //  </div>
//   // </li>
//   // <li>
//   //  <div class="some stuff">
//   // ^cursor
//   //    text
//   //  </div>
//   // </li>
//   //
//   // When a non-collapsed selection is preset, it basically deletes all the highlighted stuff
//   // and turns it into a collapsed case.
//   // If stuff is unclear please ask sergey.andreev@redpencil.io
//   insertNewLi(position: ModelPosition): void {
//     // Split the nodes at position
//     position.split();
//
//     // Variable initialization
//     let node = position.nodeAfter();
//     const newLi = new ModelElement('li');
//
//     // Find parent li
//     const parentLi = position.findAncestors(node => ModelNode.isModelElement(node) && node.type === "li")[0];
//     if (!parentLi) {
//       throw new Error("couldn't find the parent li");
//     }
//
//     //find parent ul/ol and li position
//     const parentUl = parentLi.parent;
//     if (!parentUl) {
//       throw new Error("couldn't find the parent ul/ol");
//     }
//
//     const parentLiPos = parentLi.index;
//     if (parentLiPos === null) {
//       throw new Error("couldn't find the parent li position");
//     }
//
//     //try to find the first node we can copy if there is no nodeAfter
//     //looks for a right sibling of a direct ancestor untill we reach the parent li
//     if (!node) {
//       node = this.findClosestNode(position, "right");
//       //assume that the cursor is at the end or in an empty li
//       if (!node) {
//         //add empty li to the parent ul
//         parentUl.addChild(newLi, parentLiPos + 1);
//         newLi.addChild(new ModelText(INVISIBLE_SPACE));
//
//         //set cursor position
//         const newRange = ModelRange.fromInElement(newLi, 0, 0);
//         this.model.selection.selectRange(newRange);
//         return;
//       }
//     }
//
//     let toBeInserted: ModelNode[] = [];
//     const newLiNodes = [];
//
//     newLiNodes.push({ node: node, operation: 'cut' });
//
//     //walk up the nodes and find things to cut/copy to a new li
//     while (node) {
//
//       //cut siblings and siblings of parents
//       if (node.nextSibling) {
//         node = node.nextSibling;
//         newLiNodes.push({ node: node, operation: 'cut' });
//       }
//
//       //only copy direct parents only
//       //and put siblings you cut into them
//       //break if we reached the parent li
//       else if (node.parent) {
//         if (ModelNode.isModelElement(node.parent) && node.parent.type === "li") {
//           break;
//         }
//         node = node.parent;
//         newLiNodes.push({ node: node, operation: 'copy' });
//       }
//       else {
//         throw new Error('something went horribly wrong when walking up a tree');
//       }
//     }
//
//     //update the existing list
//     newLiNodes.forEach(e => {
//       if (e.operation === 'cut') {
//         e.node.remove();
//         toBeInserted.push(e.node);
//       }
//       else if (e.operation === 'copy') {
//         //TODO (sergey): replace with shallow clone when thats available
//         const copy = e.node.clone() as ModelElement;
//         copy.children = [];
//         copy.appendChildren(...toBeInserted);
//         toBeInserted = [];
//         toBeInserted.push(copy);
//       }
//     });
//
//     newLi.appendChildren(...toBeInserted);
//     parentUl.addChild(newLi, parentLiPos + 1);
//
//     //set cursor position
//     const newRange = ModelRange.fromInElement(newLi, 0, 0);
//     this.model.selection.selectRange(newRange);
//     return;
//   }
}
