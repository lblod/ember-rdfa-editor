import EmberObject from '@ember/object';
import { reads, alias } from '@ember/object/computed';
import getRichNodeMatchingDomNode from '../get-rich-node-matching-dom-node';
import { get } from '@ember/object';
import { isBlank } from '@ember/utils';
import HandlerResponse from './handler-response';
import { invisibleSpace } from '../dom-helpers';

//'##title' will result in (##title)(##)(title)
let HEADERMARKDOWN = /(#+)(.*)/;

/**
 * handles header markdown i.e. ## title + hitting 'enter'
 *
 * @module contenteditable-editor
 * @class HeaderMarkdownHandler
 * @constructor
 * @extends EmberObject
 */
export default EmberObject.extend({
  currentNode: alias('rawEditor.currentNode'),
  currentSelection: reads('rawEditor.currentSelection'),
  richNode: reads('rawEditor.richNode'),
  rootNode: reads('rawEditor.rootNode'),

  nodeContainsHeaderMarkdown(node){
    return  node.nodeType === Node.TEXT_NODE &&
      node.textContent.match(HEADERMARKDOWN);
  },

  /**
   * tests this handler can handle the specified event
   * @method isHandlerFor
   * @param {DOMEvent} event
   * @return boolean
   * @public
   */
  isHandlerFor(event) {
    return event.type === "keydown" &&
      event.key === "Enter" &&
      this.get('rawEditor.currentSelectionIsACursor') &&
      this.nodeContainsHeaderMarkdown(this.get('currentNode'));
  },

  /**
   * handle the event
   * @method handleEvent
   * @param {DOMEvent} event
   * @return {HandlerResponse} response
   */
  handleEvent() {
    let currentNode = this.get('currentNode');
    let node = getRichNodeMatchingDomNode(currentNode, this.get('richNode'));
    let currentPosition = this.get('currentSelection')[0];
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

    this.get('rawEditor').externalDomUpdate('inserting header', insertHeader);
    this.get('rawEditor').updateRichNode();
    let richNode = getRichNodeMatchingDomNode(newCurrentNode, this.get('richNode'));
    this.get('rawEditor').setCurrentPosition(get(richNode, 'start'));
    return HandlerResponse.create({allowPropagation: false});
    }
  });
