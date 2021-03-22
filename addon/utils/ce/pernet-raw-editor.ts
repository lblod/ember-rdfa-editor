import Ember from "ember";
import {A} from '@ember/array';
import {TaskGenerator, timeout} from 'ember-concurrency';
import {task} from 'ember-concurrency-decorators';
import {diff_match_patch as DiffMatchPatch} from 'diff-match-patch';
import {walk as walkDomNode} from '@lblod/marawa/node-walker';
import {taskFor} from "ember-concurrency-ts";
import {
  getWindowSelection,
  insertNodeBAfterNodeA,
  insertTextNodeWithSpace,
  invisibleSpace,
  isDisplayedAsBlock,
  isElement,
  isList, isTextNode,
  tagName
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import {analyse as scanContexts} from '@lblod/marawa/rdfa-context-scanner';
import RawEditor from "./raw-editor";
import {
  isEmpty,
  replaceDomNode,
  selectContext,
  selectCurrentSelection,
  selectHighlight,
  triplesDefinedInResource,
  update
} from './editor';
import {findRichNode, findUniqueRichNodes} from '../rdfa/rdfa-rich-node-helpers';
import {debug, runInDebug, warn} from '@ember/debug';
import {InternalSelection, RawEditorSelection} from "@lblod/ember-rdfa-editor/editor/raw-editor";
import {computed, get} from '@ember/object';
import {PernetSelection} from "@lblod/ember-rdfa-editor/editor/pernet";
import flatMap from "@lblod/ember-rdfa-editor/utils/ce/flat-map";
import {getTextContent, processDomNode as walkDomNodeAsText} from "@lblod/ember-rdfa-editor/utils/ce/text-node-walker";
import nextTextNode from "@lblod/ember-rdfa-editor/utils/ce/next-text-node";
import forgivingAction from "@lblod/ember-rdfa-editor/utils/ce/forgiving-action";
import {
  indentAction,
  orderedListAction,
  unindentAction,
  unorderedListAction
} from "@lblod/ember-rdfa-editor/utils/ce/list-helpers";
import MovementObserver from "@lblod/ember-rdfa-editor/utils/ce/movement-observers/movement-observer";
import getRichNodeMatchingDomNode from "@lblod/ember-rdfa-editor/utils/ce/get-rich-node-matching-dom-node";
import classic from 'ember-classic-decorator';
import CappedHistory from "@lblod/ember-rdfa-editor/utils/ce/capped-history";
import RichNode from "@lblod/marawa/rich-node";
import { tracked } from '@glimmer/tracking';

export interface ContentObserver {
  handleTextInsert: (position: number, text: String, extraInfo: Array<Object>) => void
  handleTextRemoval: (start: number, end: number, extraInfo: Array<Object>) => void
  handleFullContentUpdate: (extraInfo: Array<Object>) => void
}

/**
 * Compatibility layer for components still using the Pernet API
 */
@classic
export default class PernetRawEditor extends RawEditor {
  /**
   * current textContent from editor
   *
   * @property currentTextContent
   * @type String
   * @public
   */
  @tracked currentTextContent: string | null = null
  private _currentSelection?: InternalSelection;

  history!: CappedHistory;
  /**
   * the domNode containing our caret
   *
   * __NOTE__: is set to null on a selection that spans nodes
   * @property currentNode
   * @protected
   */
  protected _currentNode: Node | null = null;

  protected movementObservers: Ember.NativeArray<MovementObserver> ;


  constructor(...args: any[]) {
    super(...args);
    this.set('history', new CappedHistory({ maxItems: 100}));
    this.movementObservers = A();
    document.addEventListener("editorModelWrite", this.createSnapshot.bind(this));
  }
  /**
   * the current selection in the editor
   *
   * @property currentSelection
   * @type Array
   * @protected
   */
  // @ts-ignore
  get currentSelection(): RawEditorSelection {
    if (this._currentSelection)
      return [this._currentSelection.startNode.absolutePosition, this._currentSelection.endNode.absolutePosition];
    else
      return [0, 0];
  }

  // @ts-ignore
  set currentSelection({startNode, endNode}: InternalSelection) {
    const oldSelection = this._currentSelection;
    this._currentSelection = {startNode, endNode};
    if (startNode.absolutePosition === endNode.absolutePosition) {
      this.moveCaretInTextNode(startNode.domNode, startNode.relativePosition);
      this.currentNode = startNode.domNode;
    } else {
      this.currentNode = null;
    }

    if (!oldSelection || (
      oldSelection.startNode.domNode != startNode.domNode ||
      oldSelection.startNode.absolutePosition != startNode.absolutePosition ||
      oldSelection.endNode.domNode != endNode.domNode ||
      oldSelection.endNode.absolutePosition != endNode.absolutePosition
    )) {
      for (const obs of this.movementObservers) {
        // typescript is confused here, I think because of EmberObjects being weird,
        // but feel free to investigate
        // @ts-ignore
        obs.handleMovement(this, oldSelection, {startNode, endNode});
      }
      taskFor(this.generateDiffEvents).perform();
    }
  }

  /**
   * Execute a command with name commandName. Any extra arguments are passed through to the command.
   * @param commandName
   * @param args
   */
  executeCommand(commandName: string, ...args: any[]) {
    super.executeCommand(commandName, ...args);
    taskFor(this.generateDiffEvents).perform();
  }

  get currentNode() {
    return this._currentNode;
  }

  set currentNode( node ) {
    // clean old marks
    for( const oldNode of document.querySelectorAll("[data-editor-position-level]") ) {
      oldNode.removeAttribute("data-editor-position-level");
    }
    // clean old RDFa marks
    for( const oldNode of document.querySelectorAll("[data-editor-rdfa-position-level]") ) {
      oldNode.removeAttribute("data-editor-rdfa-position-level");
    }

    // set current node
    this._currentNode = node;

    // add new marks
    let counter=0;
    let walkedNode = node;
    while( walkedNode && walkedNode != this.rootNode  ) {
      if( isElement( walkedNode ) ) {
        counter++;
        walkedNode.setAttribute("data-editor-position-level", counter.toString());
      }
      walkedNode = walkedNode.parentNode;
    }
    // add new rdfa marks
    let rdfaCounter=0;
    walkedNode = node;
    while( walkedNode && walkedNode != this.rootNode ) {
      if( isElement( walkedNode ) ) {
        const isSemanticNode =
          ["about","content","datatype","property","rel","resource","rev","typeof"]
            .find( (name) => (walkedNode as Element).hasAttribute(name) );
        if( isSemanticNode ) {
          rdfaCounter++;
          walkedNode.setAttribute("data-editor-rdfa-position-level", rdfaCounter.toString());
        }
      }
      walkedNode = walkedNode.parentNode;
    }
  }
  /**
   * the start of the current range
   *
   * @property currentPosition
   * @type number
   * @protected
   */
  get currentPosition() {
    return this.currentSelection[0];
  }

  /**
   * is current selection a cursor
   * @property currentSelectionIsACursor
   * @type boolean
   * @public
   */
  @computed('currentSelection')
  get currentSelectionIsACursor() {
    const sel = this.currentSelection;
    return sel[0] === sel[1];
  }

  /**
   * Called after relevant input. Checks content and calls closureActions when changes detected
   * handleTextInsert, handleTextRemove, handleFullContentUpdate
   * @method generateDiffEvents
   *
   * @param extraInfo Optional argument pass info to event consumers.
   * @public
   */
  @task({ restartable: true })
  *generateDiffEvents(extraInfo: any[] = []): TaskGenerator<void> {
    yield timeout(320);
    const newText: string = getTextContent(this.rootNode);
    let oldText: string = this.currentTextContent || "" ;
    const dmp = new DiffMatchPatch();
    const differences = dmp.diff_main(oldText, newText);
    let pos = 0;
    let textHasChanges = false;

    const contentObservers = this.contentObservers;
    for (let [mode,text] of differences) {
      if (mode === 1) {
        textHasChanges = true;
        this.currentTextContent = oldText.slice(0, pos) + text + oldText.slice(pos, oldText.length);
        for (let observer of contentObservers) {
          observer.handleTextInsert(pos, text, extraInfo);
        }
        pos = pos + text.length;
      } else if (mode === -1) {
        textHasChanges = true;
        this.currentTextContent = oldText.slice(0, pos) + oldText.slice(pos + text.length, oldText.length);
        for (let observer of contentObservers) {
          observer.handleTextRemoval(pos, pos + text.length, extraInfo);
        }
      } else {
        pos = pos + text.length;
      }
      oldText = this.currentTextContent || "";
    }

    if (textHasChanges) {
      if (!extraInfo.some((x) => x.noSnapshot)) {
        this.createSnapshot();
      }
      for (let observer of contentObservers) {
        observer.handleFullContentUpdate(extraInfo);
      }
    }
  }

  /**
   * content observers
   * @property contentObservers
   * @private
   */
  contentObservers: Array<ContentObserver> = []

  registerMovementObserver(observer: MovementObserver) {
    this.movementObservers.push(observer);
  }

  /**
   * register a content observer
   * @method registerContentObserver
   * @public
   */
  registerContentObserver(observer: ContentObserver) {
    this.contentObservers.push(observer);
  }


  /**
   * unregister a content observer
   * @method unregisterContentObserver
   * @public
   */
  unregisterContentObserver(observer: ContentObserver) {
    const index = this.contentObservers.indexOf(observer);
    if (index >= 0) {
      this.contentObservers.splice(index, 1);
    }
  }

  /**
   * Informs the consumer that the text was inserted at the given
   * position.
   *
   * Others can set it on this component, but we are the only ones to
   * call it.
   *
   * @param _position Index of the inserted text.
   * @param _text Text content that has been inserted.
   * @param _extraInfo Text content that has been inserted.
   */
  textInsert(_position: number, _text: String, _extraInfo: any ) {
    warn("textInsert was called on raw-editor without listeners being set.", { id: 'content-editable.invalid-state'});
  }



  /**
   * @method moveCaretInTextNode
   * @param textNode
   * @param position
   * @private
   */
  moveCaretInTextNode(textNode: Node, position: number){
    try {
      const currentSelection = getWindowSelection();
      currentSelection.collapse(textNode,position);
      this.rootNode.focus();
    }
    catch(e) {
      console.trace(e); // eslint-disable-line no-console
    }
  }

  /**
   * get richnode matching a DOMNode
   *
   * @method getRichNodeFor
   *
   * @param domNode node
   * @param tree
   *
   * @return {RichNode} node
   *
   * @private
   */
  getRichNodeFor(domNode: Node | null, tree = this.get('richNode')): RichNode {
    return getRichNodeMatchingDomNode(domNode, tree);
  }


  /**
   * calculate the cursor position based on a richNode and an offset from a domRANGE
   * see https://developer.mozilla.org/en-US/docs/Web/API/Range/endOffset and
   * https://developer.mozilla.org/en-US/docs/Web/API/Range/startOffset
   *
   * @method calculatePosition
   * @param {RichNode} richNode node
   * @param {Number} offset
   * @private
   */
  calculatePosition(richNode: RichNode, offset: number): number {
    const type = richNode.type;
    if (type === 'text')
      return richNode.start + offset;
    else if (type === 'tag') {
      const children = richNode.children;
      if (children && children.length > offset)
        return children[offset].start;
      else if (children && children.length == offset)
        // this happens and in that case we want to be at the end of that node, but not outside
        return children[children.length -1 ].end;
      else if(children) {
        warn(`provided offset (${offset}) is invalid for richNode of type tag with ${children.length} children`, {id: 'contenteditable-editor.invalid-range'});
        return children[children.length -1 ].end;
      }
      else {
        throw new Error(`can't calculate position for richNode of type ${type}`);
      }
    }
    else {
      throw new Error(`can't calculate position for richNode of type ${type}`);
    }
  }

  /**
   * set the carret position in the editor
   *
   * @method setCurrentPosition
   * @param position of the range
   * @param _notify observers, default true
   * @public
   */
  setCurrentPosition(position: number, _notify = true) {
    const richNode = this.richNode;
    if (richNode.end < position || richNode.start > position) {
      warn(`received invalid position, resetting to ${richNode.end} end of document`, {id: 'contenteditable-editor.invalid-position'});
      position = get(richNode, 'end');
    }
    const node = this.findSuitableNodeForPosition(position);
    if (node) {
      this.setCaret(node.domNode, position - node.start);
    }
    else {
      console.warn('did not receive a suitable node to set cursor, can\'t set cursor!'); // eslint-disable-line no-console
    }
  }


  /**
   * inserts an emtpy textnode after richnode, if non existant.
   *
   * @method insertElementsAfterRichNode
   *
   * @param richParent parent element where the elements should be added.
   * @param richNode last sibling where new elements should occur after
   *
   * @return returns last inserted element as RichNode. That is a rich textNode
   * @private
   */
  insertValidCursorNodeAfterRichNode(richParent: RichNode, richNode: RichNode): RichNode{
    if (richNode.domNode.nextSibling === null || richNode.domNode.nextSibling.nodeType !== Node.TEXT_NODE) {
      const newNode = document.createTextNode(invisibleSpace);
      return this.insertElementsAfterRichNode(richParent, richNode, [newNode]);
    }
    return walkDomNodeAsText(richNode.domNode.nextSibling);
  }

  /**
   * Prepends a list of elements to children
   *
   * @method prependElementsRichNode
   *
   * @param richParent parent element where the elements should be added.
   * @param elements array of (DOM) elements to insert
   *
   * @return {RichNode} returns last inserted element as RichNode
   * @private
   */
  prependElementsRichNode(richParent: RichNode, elements: ChildNode[]){
    const newFirstChild = elements[0];
    if(richParent.domNode.firstChild)
      richParent.domNode.insertBefore(newFirstChild, richParent.domNode.firstChild);
    else
      richParent.domNode.appendChild(newFirstChild);

    const newFirstRichChild = walkDomNodeAsText(newFirstChild);
    return this.insertElementsAfterRichNode(richParent, newFirstRichChild, elements.slice(1));
  }

  /**
   * Inserts an array of elements into the editor.
   *
   * @method insertElementsAfterRichNode
   *
   * @param richParent parent element where the elements should be added.
   * @param richNode last sibling where new elements should occur after
   * @param remainingElements array of (DOM) elements to insert
   *
   * @return {RichNode} returns last inserted element as RichNode
   * @private
   */
  insertElementsAfterRichNode(richParent: RichNode, richNode: RichNode, remainingElements: ChildNode[]): RichNode{
    if( remainingElements.length == 0 )
      return richNode;

    const nodeToInsert = remainingElements[0];

    insertNodeBAfterNodeA(richParent.domNode as HTMLElement, richNode.domNode as ChildNode, nodeToInsert);

    const richNodeToInsert = walkDomNodeAsText(nodeToInsert);

    return this.insertElementsAfterRichNode(richParent, richNodeToInsert, remainingElements.slice(1));
  }

  /**
   * reposition cursor based on available information,
   * useful if you modified the tree (splitting up text nodes for example),
   * but did not change the text content.
   * this will try to somewhat smartly place the cursor where it should be.
   * NOTE: if the currentSelection was a selection, this will place the cursor at the end of the selection!
   * NOTE: revisit this behaviour if/when the editor supports setting an actual selection and not a cursor position
   *
   * @param oldRichNodecontainingCursor the richnode the cursor was in before you started modifying the tree.
   * @method resetCursor
   * @private
   */
  resetCursor(oldRichNodecontainingCursor: RichNode) {
    const richNode = this.getRichNodeFor(this.currentNode);
    const currentPosition = this.currentSelection[1];
    if (richNode && richNode.start >= currentPosition && richNode.end <= currentPosition) {
      this.setCaret(richNode.domNode, Math.max(0,currentPosition - richNode.start));
    }
    else if(oldRichNodecontainingCursor) {
      // domNode containing cursor no longer exists, we have to reset the cursor in a different node
      // first let's try to find a parent that still exists
      let newNode = oldRichNodecontainingCursor;
      while (newNode && newNode.domNode !== this.rootNode && !this.rootNode.contains(newNode.domNode)) {
        newNode = newNode.parent;
      }
      // set the currentnode to that parent for better positioning
      this.currentNode = newNode.domNode;
      this.setCurrentPosition(currentPosition);
    }
    else {
      console.debug("have to guess cursor position, no previous richnode was provided!"); // eslint-disable-line no-console
      this.currentNode = null;
      this.setCurrentPosition(currentPosition);
    }
  }

  /**
   * Whether an element is displayed as a block
   *
   * @method isDisplayedAsBlock
   *
   * @param {RichNode} richNode Node to validate
   *
   * @return {boolean} true iff the element is displayed as a block
   *
   * @private
   */
  isDisplayedAsBlock(richNode: RichNode) {
    isDisplayedAsBlock(get(richNode, 'domNode'));
  }

  isTagWithOnlyABreakAsChild(node: RichNode) {
    const type = node.domNode.nodeType;
    const children = get(node, 'children');
    return (type === Node.ELEMENT_NODE &&
      children &&
      children.length === 1 &&
      get(children[0], 'type') === 'tag' &&
      tagName(get(children[0], 'domNode')) === 'br'
    );
  }

  insertTextNodeWithSpace(parent: RichNode, relativeToSibling = null, after = false) {
    const parentDomNode = get(parent, 'domNode');
    const textNode = insertTextNodeWithSpace(parentDomNode, relativeToSibling, after);
    this.updateRichNode();
    taskFor(this.generateDiffEvents).perform([{noSnapshot: true}]);
    return this.getRichNodeFor(textNode);
  }

  /**
   * determines best suitable node to position caret in for provided rich node and position
   * creates a text node if necessary
   * @method findSuitableNodeInRichNode
   * @param node
   * @param position
   * @return {RichNode}
   * @private
   */
  findSuitableNodeInRichNode(node: RichNode, position: number) : RichNode | null{
    if (!node) {
      console.warn('no node provided to findSuitableNodeinRichNode'); // eslint-disable-line no-console
      return null;
    }
    const appropriateTextNodeFilter = (node: RichNode) =>
      node.start <= position && node.end >= position
      && node.type === 'text'
      && ! isList(node.parent.domNode);
    const textNodeContainingPosition = flatMap(node, appropriateTextNodeFilter, true);
    if (textNodeContainingPosition.length == 1) {
      // we've found a text node! huzah!
      return textNodeContainingPosition[0];
    }
    else {
      const elementContainingPosition = flatMap(node, appropriateTextNodeFilter);
      if (elementContainingPosition.length > 0) {
        // we have to guess which element matches, taking the last matching one is a strategy that sort of works
        // this gives us the deepest/last node matching. it's horrid in the case of consecutive br's for example
        const newTextNode = nextTextNode(elementContainingPosition[elementContainingPosition.length - 1], this.rootNode);
        this.updateRichNode();
        return this.getRichNodeFor(newTextNode);
      }
      else {
        if (node.parent) {
          console.debug(`no valid node found for provided position ${position} and richNode, going up one node`, node); // eslint-disable-line no-console
          return this.findSuitableNodeInRichNode(node.parent, position);
        }
        else {
          console.warn(`no valid node found for provided position ${position} and richNode`, node); // eslint-disable-line no-console
          if (node.domNode === this.rootNode && node.start === node.end) {
            console.debug(`empty editor, creating a textNode`); // eslint-disable-line no-console
            const newNode = document.createTextNode(invisibleSpace);
            this.rootNode.appendChild(newNode);
            this.updateRichNode();
            return this.getRichNodeFor(newNode);
          }
          return null;
        }
      }
    }
  }


  /**
   * select a node based on the provided caret position, taking into account the current active node
   * if no suitable node exists, create one (within reason)
   * @method findSuitableNodeForPosition
   * @param {Number} position
   * @return {RichNode} node containing position or null if not found
   * @private
   */
  findSuitableNodeForPosition(position: number): RichNode | null {
    const currentRichNode = this.getRichNodeFor(this.currentNode);
    const richNode = this.get('richNode');
    if (currentRichNode && get(currentRichNode, 'start') <= position && get(currentRichNode, 'end') >= position) {
      const node = this.findSuitableNodeInRichNode(currentRichNode, position);
      return node;
    }
    else if (get(richNode, 'start') <= position && get(richNode, 'end') >= position){
      const node = this.findSuitableNodeInRichNode(this.get('richNode'),position);
      return node;
    }
    else {
      warn(`position ${position} is not in range of document ${get(richNode, 'start')} ${get(richNode, 'end')}`, {id: 'content-editable:not-a-suitable-position'});
      return this.findSuitableNodeForPosition(get(richNode, 'end'));
    }
  }
  /**
   * create a snapshot for undo history
   * @method createSnapshot
   * @public
   */
  createSnapshot() {
    const document = {
      content: this.get('rootNode').innerHTML,
      currentSelection: this.currentSelection
    };
    this.get('history').push(document);
  }

  /**
   * execute a DOM transformation on the editor content, ensures a consistent editor state
   * @method externalDomUpdate
   * @param {String} description
   * @param {function} domUpdate
   * @param {boolean} maintainCursor, keep cursor in place if possible
   * @public
   */
  externalDomUpdate(description: string, domUpdate:() => void, maintainCursor = false) {
    debug(`executing an external dom update: ${description}`);
    const currentNode = this.currentNode;
    const richNode = this.getRichNodeFor(currentNode);
    if (richNode) {
      const relativePosition = this.getRelativeCursorPosition();
      domUpdate();
      this.updateRichNode();
      if (maintainCursor &&
        this.currentNode === currentNode &&
        this.rootNode.contains(currentNode) &&
        currentNode &&
        relativePosition &&
        isTextNode(currentNode) &&
        currentNode.length >= relativePosition) {
        this.setCaret(currentNode,relativePosition);
      }
      else {
        this.updateSelectionAfterComplexInput();
      }
      forgivingAction('elementUpdate', this)();
      taskFor(this.generateDiffEvents).perform();
    }
    else {
      domUpdate();
      this.updateRichNode();
      this.updateSelectionAfterComplexInput();
      forgivingAction('elementUpdate', this)();
      taskFor(this.generateDiffEvents).perform();
    }
  }

  /**
   * update the selection based on dom window selection
   * to be used when we are unsure what sort of input actually happened
   *
   * @method updateSelectionAfterComplexInput
   * @private
   */
  updateSelectionAfterComplexInput() {
    const windowSelection = getWindowSelection();
    if (windowSelection.rangeCount > 0) {
      const range = windowSelection.getRangeAt(0);
      let commonAncestor = range.commonAncestorContainer;
      // IE does not support contains for text nodes
      commonAncestor = commonAncestor.nodeType === Node.TEXT_NODE ? commonAncestor.parentNode! : commonAncestor;
      if (this.get('rootNode').contains(commonAncestor)) {
        if (range.collapsed) {
          this.setCaret(range.startContainer, range.startOffset);
        }
        else {
          const startNode = this.getRichNodeFor(range.startContainer);
          const endNode = this.getRichNodeFor(range.endContainer);
          const startPosition = this.calculatePosition(startNode, range.startOffset);
          const endPosition = this.calculatePosition(endNode, range.endOffset);
          const start = {relativePosition: startPosition - startNode.start, absolutePosition: startPosition, domNode: startNode.domNode};
          const end = { relativePosition: endPosition - endNode.start, absolutePosition: endPosition, domNode: endNode.domNode};
          // @ts-ignore
          this.currentSelection = { startNode: start , endNode: end };
        }
      }
    }
    else {
      warn('no selection found on window',{ id: 'content-editable.unsupported-browser'});
    }
  }

  /**
   * set the carret on the desired position. This function ensures a text node is present at the requested position
   *
   * @method setCaret
   * @param node, a text node or dom element
   * @param offset, for a text node the relative offset within the text node (i.e. number of characters before the carret).
   *                         for a dom element the number of childnodes before the carret.
   * Examples:
   *     to set the carret after 'c' in a textnode with text content 'abcd' use setCaret(textNode,3)
   *     to set the carret after the end of a node with innerHTML `<b>foo</b><span>work</span>` use setCaret(element, 2) (e.g setCaret(element, element.children.length))
   *     to set the carret after the b in a node with innerHTML `<b>foo</b><span>work</span>` use setCaret(element, 1) (e.g setCaret(element, indexOfChild + 1))
   *     to set the carret after the start of a node with innerHTML `<b>foo</b><span>work</span>` use setCaret(element, 0)
   *
   * @public
   */
  setCaret(node: Node, offset: number) {
    const richNode = this.getRichNodeFor(node);
    if (!richNode) {
      console.debug('tried to set carret, but did not find a matching richNode for', node); // eslint-disable-line no-console
      return;
    }
    if (richNode.type === 'tag' && richNode.children) {
      if (richNode.children.length < offset) {
        warn(`invalid offset ${offset} for node ${tagName(richNode.domNode)} with ${richNode.children } provided to setCaret`, {id: 'contenteditable.invalid-start'});
        return;
      }
      const richNodeAfterCarret = richNode.children[offset];
      if (richNodeAfterCarret && richNodeAfterCarret.type === 'text') {
        // the node after the carret is a text node, so we can set the cursor at the start of that node
        const absolutePosition = richNodeAfterCarret.start;
        const position = {domNode: richNodeAfterCarret.domNode, absolutePosition, relativePosition: 0};
        // @ts-ignore
        this.currentSelection = { startNode: position, endNode: position};
      }
      else if (offset > 0 && richNode.children[offset-1].type === 'text') {
        // the node before the carret is a text node, so we can set the cursor at the end of that node
        const richNodeBeforeCarret = richNode.children[offset-1];
        const absolutePosition = richNodeBeforeCarret.end;
        const position = {domNode: richNodeBeforeCarret.domNode, absolutePosition, relativePosition: richNodeBeforeCarret.end - richNodeBeforeCarret.start};
        // @ts-ignore
        this.currentSelection = { startNode: position, endNode: position};
      }
      else {
        // no suitable text node is present, so we create a textnode
        let textNode;
        if (richNodeAfterCarret){ // insert text node before the offset
          textNode = insertTextNodeWithSpace(node, richNodeAfterCarret.domNode as ChildNode);
        }
        else if  (richNode.children.length === 0 && offset === 0) { // the node is empty (no child at position 0), offset should be zero
          // TODO: what if void element?
          textNode = insertTextNodeWithSpace(node);
        }
        else { // no node at offset, insert after the previous node
          textNode = insertTextNodeWithSpace(node, richNode.children[offset-1].domNode as ChildNode, true);
        }
        this.updateRichNode();
        const absolutePosition = this.getRichNodeFor(textNode).start;
        const position = {domNode: textNode, relativePosition: 0, absolutePosition};
        // @ts-ignore
        this.currentSelection = { startNode: position, endNode: position};
      }
    }
    else if (richNode.type === 'text') {
      const absolutePosition = richNode.start + offset;
      const position = {domNode: node, absolutePosition, relativePosition: offset};
      // @ts-ignore
      this.currentSelection = { startNode: position, endNode: position };
    }
    else {
      warn(`invalid node ${tagName(node)} provided to setCaret`, {id: 'contenteditable.invalid-start'});
    }
  }

  getRelativeCursorPosition(){
    const currentRichNode = this.getRichNodeFor(this.currentNode);
    if (currentRichNode) {
      const absolutePos = this.currentSelection[0];
      return absolutePos - currentRichNode.start;
    }
    return null;
  }

  getRelativeCursorPostion() {
    return this.getRelativeCursorPosition();
  }



  insertUL() {
    unorderedListAction(this);
  }

  insertOL() {
    orderedListAction(this);
  }

  insertIndent() {
    indentAction(this);
  }

  insertUnindent() {
    unindentAction(this);
  }
  /**
   * restore a snapshot from undo history
   * @method undo
   * @public
   */
  undo() {
    const previousSnapshot = this.get('history').pop();
    if (previousSnapshot) {
      this.get('rootNode').innerHTML = previousSnapshot.content;
      this.updateRichNode();
      this.set('currentNode', null);
      this.setCurrentPosition(previousSnapshot.currentSelection[0]);
      taskFor(this.generateDiffEvents).perform([{noSnapshot: true}]);
    }
    else {
      warn('no more history to undo', {id: 'contenteditable-editor:history-empty'});
    }
  }
  selectCurrentSelection() {
    return selectCurrentSelection.bind(this)();
  }
  selectHighlight(region: RawEditorSelection, options: Object = {}) {
    return selectHighlight.bind(this)(region, options);
  }
  selectContext(region: RawEditorSelection, options: Object = {}) {
    return selectContext.bind(this)(region, options);
  }
  update(selection: unknown, options: Object = {}) {
    this.createSnapshot();
    const rslt = update.bind(this)(selection, options);
    if(this.tryOutVdom) {
      this.model.read();
      this.model.write();
      this.updateRichNode();
    }
    return rslt;
  }
  replaceDomNode(domNode: Node, options: {callback: Function, failedCallBack: Function, motivation: string}) {
    this.createSnapshot();
    return replaceDomNode.bind(this)(domNode, options);
  }
  triplesDefinedInResource(resourceUri: string) {
    return triplesDefinedInResource.bind(this)(resourceUri);
  }
  isEmpty(selectedContexts: unknown) {
    return isEmpty.bind(this)(selectedContexts);
  }

  /**
   * Helpers
   */
  findRichNode(rdfaBlock: unknown, options: Object = {}) {
    return findRichNode.bind(this)(rdfaBlock, options);
  }
  findUniqueRichNodes(rdfaBlock: unknown, options: Object = {}) {
    return findUniqueRichNodes.bind(this)(rdfaBlock, options);
  }

  /* Potential methods for the new API */
  getContexts(options: {region: [number, number]}) {
    const {region} = options || {};
    if( region )
      return scanContexts( this.rootNode, region );
    else
      return scanContexts( this.rootNode );
  }
}
function deprecate(message: string) {
  runInDebug( () => console.trace(`DEPRECATION: ${message}`)); // eslint-disable-line no-console
}
