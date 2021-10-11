import getRichNodeMatchingDomNode from '../get-rich-node-matching-dom-node';
import { get } from '@ember/object';
import { isBlank } from '@ember/utils';
import HandlerResponse from './handler-response';
import { invisibleSpace } from '@lblod/ember-rdfa-editor/archive/utils/dom-helpers';

//'##title' will result in (##title)(##)(title)
let HEADERMARKDOWN = /(#+)(.*)/;

/**
 * handles header markdown i.e. ## title + hitting 'enter'
 *
 * @module contenteditable-editor
 * @class HeaderMarkdownHandler
 * @constructor
 */
export default class HeaderMarkdownHandler {
  constructor({rawEditor}) {
    this.rawEditor = rawEditor;
  }

  nodeContainsHeaderMarkdown(node){
    return  node.nodeType === Node.TEXT_NODE &&
      node.textContent.match(HEADERMARKDOWN);
  }

  /**
   * tests this handler can handle the specified event
   * @method isHandlerFor
   * @param {DOMEvent} event
   * @return boolean
   * @public
   */
  isHandlerFor(event){
    return event.type === "keydown" &&
      event.key === "Enter" &&
      this.rawEditor.currentSelectionIsACursor &&
      this.nodeContainsHeaderMarkdown(this.rawEditor.currentNode);
  }

  /**
   * handle header markdown event
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent() {
    let currentNode = this.rawEditor.currentNode;
    let node = getRichNodeMatchingDomNode(currentNode, this.rawEditor.richNode);
    let currentPosition = this.rawEditor.currentSelection[0];
    let newCurrentNode;

    let insertHeader = () => {
      let matchGroups = currentNode.textContent.match(HEADERMARKDOWN);
      let headerEnd = currentPosition - get(node, 'start');
      let headerLevel = matchGroups[1].length; //number of '#' provides header level
      let headerStart= matchGroups.index + headerLevel;
      let beforeHeader = document.createTextNode(currentNode.textContent.slice(0, matchGroups.index));
      let headerContent = currentNode.textContent.slice(headerStart, headerEnd);

      if (isBlank(headerContent))
        headerContent = invisibleSpace;

      let headerTextNode = document.createTextNode(headerContent);
      let headerNode = document.createElement(`h${headerLevel}`);
      headerNode.append(headerTextNode);
      let afterHeaderContent = currentNode.textContent.slice(headerEnd);

      if (isBlank(afterHeaderContent))
        afterHeaderContent = invisibleSpace;

      let afterHeader = document.createTextNode(afterHeaderContent);

      currentNode.parentNode.insertBefore(beforeHeader, currentNode);
      currentNode.parentNode.insertBefore(headerNode, currentNode);
      currentNode.parentNode.insertBefore(afterHeader, currentNode);
      currentNode.parentNode.removeChild(currentNode);
      newCurrentNode = afterHeader;
    };

    this.rawEditor.externalDomUpdate('inserting header', insertHeader);
    this.rawEditor.updateRichNode();
    let richNode = getRichNodeMatchingDomNode(newCurrentNode, this.rawEditor.richNode);
    this.rawEditor.setCurrentPosition(get(richNode, 'start'));
    return HandlerResponse.create({allowPropagation: false});
  }
}
