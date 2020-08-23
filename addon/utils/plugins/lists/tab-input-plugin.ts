import { TabInputPlugin } from '@lblod/ember-rdfa-editor/editor/input-handlers/tab-handler';
import { Editor, Manipulation, ManipulationGuidance } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import { isList,
         isLI,
         getAllLisFromList,
         isEmptyList,
         siblingLis,
         findLastLi
       } from '@lblod/ember-rdfa-editor/utils/ce/dom-helpers';
import { indentAction, unindentAction } from '@lblod/ember-rdfa-editor/utils/ce/list-helpers';
import { ensureValidTextNodeForCaret } from '@lblod/ember-rdfa-editor/editor/utils';


/**
 * Current behaviour
 * - case not first or last LI:
 *  - if cursor at at beginning of LI + (shift or shift + tab) indents or unindents
 *  - if cursor not at the end of LI jumps to next or previous LI
 *
 * - else: jumps out of list
 * @class ListTabInputPlugin
 * @module plugin/lists
 */
export default class ListTabInputPlugin implements TabInputPlugin {
  label = 'Tap input plugin for handling List interaction'

  guidanceForManipulation(manipulation : Manipulation) : ManipulationGuidance | null {
    if( manipulation.type == 'moveCursorToStartOfElement' ){
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

        if( lastLi.isSameNode(listItem) ){
          return { allow: true, executor: this.jumpOutOfList };
        }
        else {
          return { allow: true, executor: this.jumpToNextLi };
        }
      }
    }

    else if( manipulation.type == 'moveCursorToEndOfElement' ){
      if(isList(manipulation.node)){
        return { allow: true, executor: this.jumpIntoLastLi };
      }
    }

    else if ( manipulation.type == 'moveCursorBeforeElement' && isLI(manipulation.node) ){
      const listItem = manipulation.node as HTMLElement;
      //If cursor at beginning of LI, then do the unindent
      //Note: this might be suprising and we also might want the cursor to be at the end of the LI
      if(manipulation.selection
         && manipulation.selection.anchorOffset === 0
         && manipulation.selection.anchorNode
         && manipulation.selection.anchorNode.isSameNode(listItem.firstChild) ){
        return { allow: true, executor: this.unindentLiContent };
      }
      else {
        const list = listItem.parentElement;
        const firstLi = getAllLisFromList(list)[0] as HTMLElement;

        if( firstLi.isSameNode(listItem) ){
          return { allow: true, executor: this.jumpOutOfListToStart };
        }
        else {
          return { allow: true, executor: this.jumpToPreviousLi };
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
    setCursorAtStartOfLi(firstLi, editor);
  }

  /**
   * Sets the cursor in the last <li></li>. If list is empty, creates an <li></li>
   */
  jumpIntoLastLi(manipulation: Manipulation, editor: Editor) : void {
    const list = manipulation.node as HTMLElement;
    let lastLi;

    //This branch creates a new LI, but not really sure if we want that.
    if(isEmptyList(list)){
      lastLi = document.createElement('li');
      list.append(lastLi);
    }
    else {
      lastLi = [ ...getAllLisFromList(list) ].reverse()[0] as HTMLElement;
    }
    setCursorAtEndOfLi(lastLi, editor);
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
   * Merges nested list to parent list
   * Note: depends on list helpers from a long time ago.
   * TODO: Indent means the same as merge nested list, perhaps rename the action
   */
  unindentLiContent(_: Manipulation, editor: Editor) : void {
    unindentAction(editor); //TODO: this is legacy, this should be revisited.
  }

  /*
   * Jumps to next List item. Assumes there is one and current LI is not the last
   */
  jumpToNextLi(manipulation: Manipulation, editor: Editor) : void {
    //Assumes the LI is not the last one
    const listItem = manipulation.node as HTMLElement;
    const listItems = siblingLis(listItem);
    const indexOfLi = listItems.indexOf(listItem);
    setCursorAtStartOfLi(listItems[indexOfLi + 1], editor);
  }

  /*
   * Jumps to next List item. Assumes there is one and current LI is not the first
   */
  jumpToPreviousLi(manipulation: Manipulation, editor: Editor) : void {
    //Assumes the LI is not the last one
    const listItem = manipulation.node as HTMLElement;
    const listItems = siblingLis(listItem);
    const indexOfLi = listItems.indexOf(listItem);
    setCursorAtEndOfLi(listItems[indexOfLi - 1], editor);
  }

  /*
   * Jumps outside of list.
   */
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

    textNode = ensureValidTextNodeForCaret(textNode as Text);
    editor.updateRichNode();
    editor.setCarret(textNode, 0);
  }

  /*
   * Jumps outside of at the start
   */
  jumpOutOfListToStart(manipulation: Manipulation, editor: Editor) : void {
    const element = manipulation.node.parentElement; //this is the list
    if(!element) throw 'Tab-input-handler expected list to be attached to DOM';

    let textNode;
    if(element.previousSibling && element.previousSibling.nodeType == Node.TEXT_NODE){
      textNode = element.previousSibling;
    }
    else {
      textNode = document.createTextNode('');
      element.before(textNode);
    }
    textNode = ensureValidTextNodeForCaret(textNode as Text);
    editor.updateRichNode();
    editor.setCarret(textNode, (textNode as Text).length);
  }
}

function setCursorAtStartOfLi(listItem : HTMLElement, editor: Editor) : void{
  let textNode;
  if(listItem.firstChild && listItem.firstChild.nodeType == Node.TEXT_NODE){
    textNode = listItem.firstChild;
  }
  else {
    textNode = document.createTextNode('');
    listItem.prepend(textNode);
  }
  textNode = ensureValidTextNodeForCaret(textNode as Text);
  editor.updateRichNode();
  editor.setCarret(textNode, 0)
}

function setCursorAtEndOfLi(listItem : HTMLElement, editor: Editor) : void {
  let textNode;
  if(listItem.lastChild && listItem.lastChild.nodeType == Node.TEXT_NODE){
    textNode = listItem.lastChild;
  }
  else {
    textNode = document.createTextNode('');
    listItem.append(textNode);
  }
  textNode = ensureValidTextNodeForCaret(textNode as Text);
  editor.updateRichNode();
  editor.setCarret(textNode, (textNode as Text).length);
}
