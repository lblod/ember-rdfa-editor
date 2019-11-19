import EmberObject from '@ember/object';
import { reads, alias } from '@ember/object/computed';
import getRichNodeMatchingDomNode from '../get-rich-node-matching-dom-node';
import { get } from '@ember/object';
import { isBlank } from '@ember/utils';
import HandlerResponse from './handler-response';
import { invisibleSpace } from '../dom-helpers';


let BOLDMARKDOWN = /(\*\*)(.*?)\1/;
let EMPHASISMARKDOWN = /(\*)([^*].+?)\1/;
let UNDERLINEMARKDOWN = /(_)(.*?)\1/;

let MARKDOWNS = [
  {pattern: BOLDMARKDOWN, tag: 'strong'},
  {pattern: EMPHASISMARKDOWN, tag: 'em'},
  {pattern: UNDERLINEMARKDOWN, tag: 'u'}
];

/**
 * handles emphasis markdown
 *
 * @module contenteditable-editor
 * @class EmphasisMarkdownHandler
 * @constructor
 * @extends EmberObject
 */
export default EmberObject.extend({
  currentNode: alias('rawEditor.currentNode'),
  currentSelection: reads('rawEditor.currentSelection'),
  richNode: reads('rawEditor.richNode'),
  rootNode: reads('rawEditor.rootNode'),

  nodeContainsRelevantMarkdown(node){
    if(!node.nodeType === Node.TEXT_NODE)
      return false;
    return this.findMarkdown(node.textContent);
  },

  findMarkdown(text){
    return MARKDOWNS.find(m => { return text.match(m.pattern); });
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
      this.get('rawEditor.currentSelectionIsACursor') &&
      event.key == ' ' &&
      this.nodeContainsRelevantMarkdown(this.get('currentNode'));
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

    let markdown = this.findMarkdown(currentNode.textContent).pattern;

    let insertElement = () => {
      let matchGroups = currentNode.textContent.match(markdown);
      let contentEnd = currentPosition - matchGroups[1].length - get(node, 'start');
      let contentStart = currentPosition - get(node, 'start') - matchGroups[0].length + matchGroups[1].length;
      let beforeContentNode = document.createTextNode(currentNode.textContent.slice(0, matchGroups.index));
      let elementContent = currentNode.textContent.slice(contentStart, contentEnd);

      if (isBlank(elementContent))
        elementContent = invisibleSpace;

      let contentTextNode = document.createTextNode(elementContent);
      let contentNode = document.createElement(this.findMarkdown(currentNode.textContent).tag);
      contentNode.append(contentTextNode);
      let afterContent = currentNode.textContent.slice(contentEnd + matchGroups[1].length);

      if(isBlank(afterContent))
        afterContent = invisibleSpace;

      let afterContentNode = document.createTextNode(afterContent);

      currentNode.parentNode.insertBefore(beforeContentNode, currentNode);
      currentNode.parentNode.insertBefore(contentNode, currentNode);
      currentNode.parentNode.insertBefore(afterContentNode, currentNode);
      currentNode.parentNode.removeChild(currentNode);
      newCurrentNode = afterContentNode;
    };

    this.get('rawEditor').externalDomUpdate('inserting markdown', insertElement);
    this.get('rawEditor').updateRichNode();
    let richNode = getRichNodeMatchingDomNode(newCurrentNode, this.get('richNode'));
    this.get('rawEditor').setCurrentPosition(get(richNode, 'start'));
    return HandlerResponse.create({allowPropagation: false});
  }
});
