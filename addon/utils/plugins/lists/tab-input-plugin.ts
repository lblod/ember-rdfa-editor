import { TabInputPlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import { Editor, Manipulation, ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import { isList, isLI, getAllLisFromList, isEmptyList, siblingLis, findLastLi } from '@lblod/ember-rdfa-editor/utils/ce/dom-helpers';
import { indentAction } from '@lblod/ember-rdfa-editor/utils/ce/list-helpers';
import { stringToVisibleText } from '@lblod/ember-rdfa-editor/editor/input-handlers/backspace-handler'

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

      if(stringToVisibleText(listItem.innerText).length === 0){
        return { allow: true, executor: this.indentLiContent };
      }
      else {

        const list = manipulation.node.parentElement;
        const lastLi = findLastLi(list);

        if(lastLi.isSameNode(listItem)){
          return { allow: true, executor: this.jumpOutOfList };
        }
        else {
          return { allow: true, executor: this.jumpToNextLi };
        }
      }

    }
    return null;
  }

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
    setCursorAtBeginningOfElement(firstLi, editor);
  }

  indentLiContent(_: Manipulation, editor: Editor) : void {
    indentAction(editor); //TODO: this is legacy, this should be revisited.
  }

  jumpToNextLi(manipulation: Manipulation, editor: Editor) : void {
    //Assumes the LI is not the last one
    const listItem = manipulation.node as HTMLElement;
    const listItems = siblingLis(listItem);
    const indexOfLi = listItems.indexOf(listItem);
    setCursorAtBeginningOfElement(listItems[indexOfLi + 1], editor);
  }

  jumpOutOfList(manipulation: Manipulation, editor: Editor) : void {
    const element = manipulation.node.parentElement; //this is the list
    if(!element) throw 'Tab-input-handler expected list to be attached to DOM';
    let textNode;
    if(element.nextSibling && element.nextSibling.nodeType == Node.TEXT_NODE){
      textNode = element.nextSibling;
    }
    else {
      textNode = document.createTextNode('');
      element.after(textNode);
    }

    editor.updateRichNode();
    editor.setCarret(textNode, 0);
  }
}

function setCursorAtBeginningOfElement(element : HTMLElement, editor: Editor){
  let textNode;
  if(element.firstChild && element.firstChild.nodeType == Node.TEXT_NODE){
    textNode = element.firstChild;
  }
  else {
    textNode = document.createTextNode('');
    element.prepend(textNode);
  }
  editor.updateRichNode();
  editor.setCarret(textNode, 0);
}
