import getRichNodeMatchingDomNode from '../get-rich-node-matching-dom-node';
import { get } from '@ember/object';
import { isBlank } from '@ember/utils';
import HandlerResponse from './handler-response';
import { invisibleSpace } from '@lblod/ember-rdfa-editor/archive/utils/dom-helpers';


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
 * It checks for `*some text here*` `_some text here_` and `**some text here**`
 * and then triggers if you put a space behind those snippets
 *
 * @module contenteditable-editor
 * @class EmphasisMarkdownHandler
 * @constructor
 */
export default class EmphasisMarkdownHandler {
  constructor({rawEditor}) {
    this.rawEditor = rawEditor;
  }

  nodeContainsRelevantMarkdown(node){
    if(!node.nodeType === Node.TEXT_NODE)
      return false;
    return this.findMarkdown(node.textContent);
  }

  findMarkdown(text){
    return MARKDOWNS.find(m => { return text.match(m.pattern); });
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
      this.rawEditor.currentSelectionIsACursor &&
      event.key == ' ' &&
      this.nodeContainsRelevantMarkdown(this.rawEditor.currentNode);
  }

  /**
   * handle emphasis markdown event
   * @method handleEvent
   * @return {HandlerResponse}
   * @public
   */
  handleEvent() {
    let currentNode = this.rawEditor.currentNode;
    let node = getRichNodeMatchingDomNode(currentNode, this.rawEditor.richNode);
    let currentPosition = this.rawEditor.currentSelection[0];
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

    this.rawEditor.externalDomUpdate('inserting markdown', insertElement);
    this.rawEditor.updateRichNode();
    let richNode = getRichNodeMatchingDomNode(newCurrentNode, this.rawEditor.richNode);
    this.rawEditor.setCurrentPosition(get(richNode, 'start'));
    return HandlerResponse.create({allowPropagation: false});
  }

}

