import EmberObject from '@ember/object';
import PernetRawEditor from "@lblod/ember-rdfa-editor/utils/ce/pernet-raw-editor";
import { runInDebug, warn } from '@ember/debug';
import {createElementsFromHTML, removeNode} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import { A } from '@ember/array';
import Ember from "ember";
import nextTextNode from "@lblod/ember-rdfa-editor/utils/ce/next-text-node";
import previousTextNode from "@lblod/ember-rdfa-editor/utils/ce/previous-text-node";
import { taskFor } from "ember-concurrency-ts";
import classic from "ember-classic-decorator";

/**
 * Compatibility layer for components using the deprecated
 * pre-pernet API
 */
@classic
export default class LegacyRawEditor extends PernetRawEditor {
  /**
   * components present in the editor
   *
   * __NOTE__: this is an experimental feature that might be removed
   * @property components
   * @type {Object}
   * @public
   */
  components!: Ember.NativeArray<{id: string}>;
  constructor(...args: unknown[]) {
    super(...args);
    this.set('components', A());
  }
  /**
   *
   * @method replaceTextWithHTML
   * @param {Number} start index absolute
   * @param {Number} end index absolute
   * @param {String} html string
   * @deprecated please use RawEditor.update
   * @public
   */
  replaceTextWithHTML(start: number, end: number, html: string) {
    deprecate('deprecated call to replaceTextWithHTML in rawEditor, please use the pernet api with set.innerHTML');
    this.createSnapshot();
    const selection = this.selectHighlight([start, end]);
    this.update(selection, {set: {innerHTML: html}});
  }

  /**
   * replaces dom node with html string.
   *
   * @method replaceNodeWithHTML
   * @param node DomNode to work on
   * @param html string containing html
   * @param placeCursorAfterInsertedHtml instructive to place cursor after inserted HTML,
   * @param extraInfo Optional extra info, which will be passed around when triggering update events.
   * @return returns inserted domNodes (with possibly an extra trailing textNode).
   * @deprecated please use RawEditor.update
   */
  replaceNodeWithHTML(node: Node, html:string, placeCursorAfterInsertedHtml = false, extraInfo = []){
    //TODO: make sure the elements to insert are non empty when not allowed, e.g. <div></div>
    //TODO: think: what if htmlstring is "<div>foo</div><div>bar</div>" -> do we need to force a textnode in between?

    //keeps track of current node.
    const getCurrentCarretPosition = this.getRelativeCursorPosition();
    const currentNode = this.currentNode;

    const keepCurrentPosition = !placeCursorAfterInsertedHtml && !node.isSameNode(currentNode) && !node.contains(currentNode);

    if(!placeCursorAfterInsertedHtml && (node.isSameNode(currentNode) || node.contains(currentNode)))
      warn(`Current node is same or contained by node to replace. Current node will change.`,
        {id: 'contenteditable.replaceNodeWithHTML.currentNodeReplace'});

    //find rich node matching dom node
    const richNode = this.getRichNodeFor(node);
    if(!richNode) return null;

    const richParent = richNode.parent;
    if (!richParent) return null;

    //insert new nodes first
    const domNodesToInsert = createElementsFromHTML(html);

    let lastInsertedRichElement = this.insertElementsAfterRichNode(richParent, richNode, domNodesToInsert);
    lastInsertedRichElement = this.insertValidCursorNodeAfterRichNode(richParent, lastInsertedRichElement);

    // proceed with removal
    removeNode(richNode.domNode);

    //update editor state
    const textNodeAfterInsert = !keepCurrentPosition ? nextTextNode(lastInsertedRichElement.domNode, this.rootNode) : null;
    this.updateRichNode();
    taskFor(this.generateDiffEvents).perform(extraInfo);
    if(keepCurrentPosition) {
      if(currentNode && getCurrentCarretPosition) {
        this.setCaret(currentNode, getCurrentCarretPosition);
      }
    }
    else {
      this.setCaret(textNodeAfterInsert,0);
    }
    if(lastInsertedRichElement.domNode.isSameNode(domNodesToInsert.slice(-1)[0]))
      return domNodesToInsert;
    return [...domNodesToInsert, lastInsertedRichElement.domNode];
  }

  /**
   * removes a node. If node to be removed is contains current cursor position. The cursor
   * position will be update to a previous sensible node too.
   * @method removeNode
   * @param node DomNode to work on
   * @param extraInfo Optional extra info, which will be passed around when triggering update events.
   *
   * @return returns node we ended up in.
   * @public
   * @deprecated please use RawEditor.update
   */
  removeNode(node: Node, extraInfo = []){
    //keeps track of current node.
    let carretPositionToEndIn = this.getRelativeCursorPosition();
    let nodeToEndIn = this.currentNode as Text;
    const keepCurrentPosition = !node.isSameNode(nodeToEndIn) && !node.contains(nodeToEndIn);

    if(!keepCurrentPosition){
      nodeToEndIn = previousTextNode(node, this.rootNode);
      if(nodeToEndIn) {
        carretPositionToEndIn = nodeToEndIn.length;
      }
    }

    //find rich node matching dom node
    const richNode = this.getRichNodeFor(node);
    if(!richNode) return null;

    // proceed with removal
    removeNode(richNode.domNode);

    this.updateRichNode();
    taskFor(this.generateDiffEvents).perform(extraInfo);

    if(carretPositionToEndIn) {
      this.setCaret(nodeToEndIn, carretPositionToEndIn);
    }

    return nodeToEndIn;
  }

  /**
   * Prepends the children of a node with an html block
   * @method prependChildrenHTML
   * @param node DomNode to work on
   * @param html string containing html
   * @param placeCursorAfterInsertedHtml instructive to place cursor after inserted HTML,
   * @param extraInfo Optional extra info, which will be passed around when triggering update events.
   *
   * @return returns inserted domNodes (with possibly an extra trailing textNode).
   * @public
   */
  prependChildrenHTML(node: Node, html: string, placeCursorAfterInsertedHtml = false, extraInfo = []){
    //TODO: check if node allowed children?
    const getCurrentCarretPosition = this.getRelativeCursorPosition();
    const currentNode = this.currentNode;

    const keepCurrentPosition = !placeCursorAfterInsertedHtml;

    //find rich node matching dom node
    const richParent = this.getRichNodeFor(node);
    if(!richParent) return null;

    //insert new nodes first
    const domNodesToInsert = createElementsFromHTML(html);

    if (domNodesToInsert.length == 0)
      return [ node ];

    let lastInsertedRichElement = this.prependElementsRichNode(richParent, domNodesToInsert);
    lastInsertedRichElement = this.insertValidCursorNodeAfterRichNode(richParent, lastInsertedRichElement);

    //update editor stat style={{if this.isBold "background-color: greene
    const textNodeAfterInsert = !keepCurrentPosition ? nextTextNode(lastInsertedRichElement.domNode, this.rootNode) : null;
    this.updateRichNode();
    taskFor(this.generateDiffEvents).perform(extraInfo);
    if(getCurrentCarretPosition && currentNode && keepCurrentPosition) {
      this.setCaret(currentNode, getCurrentCarretPosition);
    }
    else {
      this.setCaret(textNodeAfterInsert,0);
    }

    if(lastInsertedRichElement.domNode.isSameNode(domNodesToInsert.slice(-1)[0]))
      return domNodesToInsert;
    return [...domNodesToInsert, lastInsertedRichElement.domNode];
  }

  /**
   * insert a component at the provided position
   * @method insertComponent
   * @param {Number} position
   * @param {String} name componentName
   * @param {Object} content componentContent
   * @param {String} id componentID
   * @return {String} id componentID
   * @public
   */
  insertComponent(position: number | Element, name: string, content: unknown, id = uuidv4()) {
    let el;
    if (position instanceof Element) {
      el = position;
    }
    else {
      throw new Error("LegacyRawEditor.insertComponent: This codepath is broken and needs to be re-evaluated");
      // This was the original code which can not work since replaceTextWithHTML does not return anything.
      // It's unclear what this was supposed to do and the method is deprecated anyway
      // [el] = this.replaceTextWithHTML(position, position, `<div contenteditable="false" id="editor-${id}"><!-- component ${id} --></div>`);

    }

    const config = { id, element: el, name, content: EmberObject.create(content) };
    this.components.pushObject(config);
    this.updateRichNode();
    this.updateSelectionAfterComplexInput();
    return id;
  }

  /**
   * remove a component
   * @method removeComponent
   * @param id componentID
   * @public
   */
  removeComponent(id: string) {
    const item = this.components.find( (item) => item.id === id);
    if(item) {
      this.components.removeObject(item);
    }
    this.updateRichNode();
    this.updateSelectionAfterComplexInput();
  }
}
function deprecate(message: string) {
  runInDebug( () => console.trace(`DEPRECATION: ${message}`)); // eslint-disable-line no-console
}
function uuidv4() {
  // this actually does work because of JS conversion magic.
  // copied from a library, so it's ugly but probably very optimized
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => {
    return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
  });
}
