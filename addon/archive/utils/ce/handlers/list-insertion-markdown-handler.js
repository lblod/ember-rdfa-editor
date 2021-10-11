import { isBlank } from '@ember/utils';
import HandlerResponse from './handler-response';
import { invisibleSpace } from '@lblod/ember-rdfa-editor/archive/utils/dom-helpers';


let OLMARKDOWN = /(1\.\s)(.*)/;
let ULMARKDOWN = /(\*\.\s)(.*)/;

let MARKDOWNS = [
  {pattern: OLMARKDOWN, tag: 'ol'},
  {pattern: ULMARKDOWN, tag: 'ul'},
];

/**
 * handles new creation markdown
 *
 * @module contenteditable-editor
 * @class ListInsertionMarkdownHandler
 * @constructor
 */
export default class ListInsertionMarkdownHandler {
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

  isHandlerFor(event) {
    return event.type === 'keydown' &&
      this.rawEditor.currentSelectionIsACursor &&
      event.key == 'Enter' &&
      this.nodeContainsRelevantMarkdown(this.rawEditor.currentNode);
  }


  handleEvent() {
    const currentNode = this.rawEditor.currentNode;
    const markdown = this.findMarkdown(currentNode.textContent).pattern;

    let insertElement = () => {
      let newCurrentNode;
      let matchGroups = currentNode.textContent.match(markdown);
      let beforeContent = currentNode.textContent.slice(0, matchGroups.index);
      let beforeContentNode = document.createTextNode(beforeContent);
      let elementContent = matchGroups[2];

      let contentTextNode = document.createTextNode(this.isVisiblyEmptyString(elementContent) ? invisibleSpace: elementContent);
      let listNode = document.createElement(this.findMarkdown(currentNode.textContent).tag);

      //insert the node with content
      let liNode = document.createElement('li');
      liNode.append(contentTextNode);
      listNode.append(liNode);

      let liNodeForCursor = liNode;
      if(!this.isVisiblyEmptyString(elementContent)) {
        //add a second li, because it feels as expected behaviour for user
        liNodeForCursor = document.createElement('li');
        liNodeForCursor.append(document.createTextNode(invisibleSpace));
        listNode.append(liNodeForCursor);
      }

      //TODO: is this required?
      if(!isBlank(beforeContent))
        currentNode.parentNode.insertBefore(beforeContentNode, currentNode);

      currentNode.parentNode.insertBefore(listNode, currentNode);
      // provide a text node after the list
      currentNode.parentNode.insertBefore(document.createTextNode(invisibleSpace), currentNode);
      currentNode.parentNode.removeChild(currentNode);
      newCurrentNode = liNodeForCursor.childNodes[0];
      this.rawEditor.updateRichNode();
      this.rawEditor.set('currentNode', newCurrentNode);
      const richNode = this.rawEditor.getRichNodeFor(newCurrentNode);
      this.rawEditor.setCurrentPosition(richNode.start);
    };

    this.rawEditor.externalDomUpdate('inserting markdown', insertElement);
    return HandlerResponse.create({allowPropagation: false});
  }

  isVisiblyEmptyString(string_instance){
    return string_instance.length === 0 || (new RegExp( '^' + invisibleSpace + '+$')).test(string_instance);
  }
}
