import { TabInputPlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import { Editor, Manipulation, ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import { isList, isLI, getAllLisFromList, isEmptyList, siblingLis, findLastLi, tagName } from '@lblod/ember-rdfa-editor/utils/ce/dom-helpers';
import { indentAction } from '@lblod/ember-rdfa-editor/utils/ce/list-helpers';
import { invisibleSpace } from '@lblod/ember-rdfa-editor/utils/ce/dom-helpers';

/**
 *
 * @class ListTabInputPlugin
 * @module plugin/lists
 */
export default class ListTabInputPlugin implements TabInputPlugin {
  label = 'Tap input plugin for handling List interaction'

  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    if( manipulation.type == 'moveCursorInsideNonVoidAndVisibleElementAtStart' ){
      if(isList(manipulation.node)){
        return { allow: true, executor: this.jumpIntoFirstLi };
      }
    }
    else if( manipulation.type == 'moveCursorAfterElement' && isLI(manipulation.node)){
      //Some choices have been made. Let's try to follow more or less the most popular html editor

      const listItem = manipulation.node as HTMLElement;

      //If cursor at beginning of LI, then do the indent
      if(manipulation.selection.anchorOffset === 0
         && manipulation.selection.anchorNode
         && manipulation.selection.anchorNode.isSameNode(manipulation.node.firstChild) ){
        return { allow: true, executor: this.indentLiContent };
      }
      else {

        const list = manipulation.node.parentElement;
        const lastLi = findLastLi(list);

        if(lastLi.isSameNode(listItem) && isLiInNestedList(listItem) ){
          return { allow: true, executor: this.jumpToNextLiOfParentList };
        }
        else if( lastLi.isSameNode(listItem) ){
          return { allow: true, executor: this.jumpOutOfList };
        }
        else {
          return { allow: true, executor: this.jumpToNextLi };
        }
      }

    }
    return null;
  }

  /**
   * Sets the cursor in the first <li></li>. If list is empty, creates an <li></li>
   */
  jumpIntoFirstLi(manipulation: Manipulation, editor: Editor) : void {
    const list = manipulation.node as HTMLElement;
    let firstLi;

    //This branch creates a new LI, but not really sure if we want that.
    if(isEmptyList(list)){
      firstLi = document.createElement('li');
      list.append(firstLi);
    }
    else {
      firstLi = getAllLisFromList(list)[0] as HTMLElement;
    }
    setCursorAtBeginningOfLi(firstLi, editor);
  }

  /*
   * Creates nested list
   * Note: depends on list helpers from a long time ago.
   * TODO: Indent means the same as nested list, perhaps rename the action
   */
  indentLiContent(_: Manipulation, editor: Editor) : void {
    indentAction(editor); //TODO: this is legacy, this should be revisited.
  }

  /*
   * Jumps to next List item. Assumes there is one and current LI is not the last
   */
  jumpToNextLi(manipulation: Manipulation, editor: Editor) : void {
    //Assumes the LI is not the last one
    const listItem = manipulation.node as HTMLElement;
    const listItems = siblingLis(listItem);
    const indexOfLi = listItems.indexOf(listItem);
    setCursorAtBeginningOfLi(listItems[indexOfLi + 1], editor);
  }

  /*
   * Jumps outside of list.
   */
  jumpOutOfList(manipulation: Manipulation, editor: Editor) : void {
    const element = manipulation.node.parentElement; //this is the list
    if(!element) throw 'Tab-input-handler expected list to be attached to DOM';

    if(element.nextSibling && element.nextSibling.nodeType == Node.TEXT_NODE){
      //TODO: what if textNode does contain only invisible white space? Then user won't see any jumps.
      const textNode = element.nextSibling;
      editor.updateRichNode();
      editor.setCarret(textNode, 0);
    }

    else {
      //Adding invisibleSpace, to make sure that if LI is last node in parent, the user notices cursor jump
      //TODO: probably some duplicat logic wit editor.setCarret
      const textNode = document.createTextNode(invisibleSpace);
      element.after(textNode);
      editor.updateRichNode();
      editor.setCarret(textNode, textNode.length);
    }
  }

  /*
   * Jumps to the LI of parent list. Creates a list item in the parent list if non remains.
   */
  jumpToNextLiOfParentList(manipulation: Manipulation, editor: Editor){
    const list =  manipulation.node.parentElement;

    if( !list ) throw 'lists/tab-input-plugin expected list to exist';
    const parentLi = list.parentElement;

    if( !parentLi ) throw 'lists/tab-input-plugin expected parentLi to exist';

    const parentList = parentLi.parentElement;
    if( !parentList ) throw 'lists/tab-input-plugin expected parentList to exist';

    //start positioning
    const listItems = siblingLis(parentLi);
    const indexOfLi = listItems.indexOf(parentLi);

    let nextLi;

    if(indexOfLi == listItems.length - 1){
      nextLi = document.createElement('li');
      parentList.append(nextLi);
    }
    else {
      nextLi = listItems[indexOfLi + 1];
    }
    setCursorAtBeginningOfLi(nextLi, editor);
  }
}

function setCursorAtBeginningOfLi(listItem : HTMLElement, editor: Editor){
  let textNode;
  if(listItem.firstChild && listItem.firstChild.nodeType == Node.TEXT_NODE){
    textNode = listItem.firstChild;
  }
  else {
    //Note: I create an empty textNode, I consider this to be sufficient for the user to see somthing happens on screen.
    //It kinda assumes this function is called when coming from another listItem
    textNode = document.createTextNode('');
    listItem.prepend(textNode);
  }
  editor.updateRichNode();
  editor.setCarret(textNode, 0);
}

function isLiInNestedList( li: HTMLElement ) : boolean{
  const list =  li.parentElement;

  if(!list){
    return false;
  }

  const parentLi = list.parentElement;

  if(!parentLi){
    return false;
  }

  const parentList = parentLi.parentElement;
  if(!parentList) {
    return false;
  }

  if(tagName(parentList) === 'ul' || tagName(parentList) === 'ol'){
    return true
  }

  return false;
}
