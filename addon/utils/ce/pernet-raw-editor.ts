import Ember from 'ember';
import { A } from '@ember/array';
import {
  getWindowSelection,
  insertTextNodeWithSpace,
  isDisplayedAsBlock,
  isElement,
  isList,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import RawEditor, { RawEditorProperties } from './raw-editor';
import { debug, warn } from '@ember/debug';
import flatMap from '@lblod/ember-rdfa-editor/utils/ce/flat-map';
import {
  processDomNode as walkDomNodeAsText,
} from '@lblod/ember-rdfa-editor/utils/ce/text-node-walker';
import nextTextNode from '@lblod/ember-rdfa-editor/utils/ce/next-text-node';
import MovementObserver from '@lblod/ember-rdfa-editor/utils/ce/movement-observers/movement-observer';
import getRichNodeMatchingDomNode from '@lblod/ember-rdfa-editor/utils/ce/get-rich-node-matching-dom-node';
import CappedHistory from '@lblod/ember-rdfa-editor/utils/ce/capped-history';
import RichNode from '@lblod/marawa/rich-node';
import { tracked } from '@glimmer/tracking';
import { Editor } from '@lblod/ember-rdfa-editor/editor/input-handlers/manipulation';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { Region } from '@lblod/marawa/rdfa-block';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';

export interface ContentObserver {
  handleTextInsert: (
    position: number,
    text: string,
    extraInfo: Array<unknown>
  ) => void;
  handleTextRemoval: (
    start: number,
    end: number,
    extraInfo: Array<unknown>
  ) => void;
  handleFullContentUpdate: (extraInfo: Array<unknown>) => void;
}

export type RawEditorSelection = Region;

export interface InternalSelection {
  startNode: RichNode;
  endNode: RichNode;
}

/**
 * Compatibility layer for components still using the Pernet API
 */
export default class PernetRawEditor extends RawEditor implements Editor {
  /**
   * current textContent from editor
   *
   * @property currentTextContent
   * @type String
   * @public
   */
  @tracked
  currentTextContent: string | null = null;
  @tracked
  private _currentSelection?: InternalSelection;

  @tracked
  history!: CappedHistory;

  /**
   * the domNode containing our caret
   *
   * __NOTE__: is set to null on a selection that spans nodes
   * @property currentNode
   * @protected
   */
  protected _currentNode: Node | null = null;

  protected movementObservers: Ember.NativeArray<MovementObserver>;

  constructor(properties: RawEditorProperties) {
    super(properties);
    this.history = new CappedHistory({ maxItems: 100 });
    this.movementObservers = A();
    document.addEventListener(
      'editorModelWrite',
      this.createSnapshot.bind(this)
    );
    this.eventBus.on(
      'contentChanged',
      () => {
        this.updateRichNode();
      },
      { priority: 'highest' }
    );
  }

  /**
   * the current selection in the editor
   *
   * @property currentSelection
   * @type Array
   * @protected
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  get currentSelection(): RawEditorSelection {
    if (this._currentSelection)
      return [
        this._currentSelection.startNode.absolutePosition,
        this._currentSelection.endNode.absolutePosition,
      ];
    else return [0, 0];
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  set currentSelection({ startNode, endNode }: InternalSelection) {
    const oldSelection = this._currentSelection;
    this._currentSelection = { startNode, endNode };
    if (startNode.absolutePosition === endNode.absolutePosition) {
      this.moveCaretInTextNode(startNode.domNode, startNode.relativePosition);
      this.currentNode = startNode.domNode;
    } else {
      this.currentNode = null;
    }

    if (
      !oldSelection ||
      oldSelection.startNode.domNode != startNode.domNode ||
      oldSelection.startNode.absolutePosition != startNode.absolutePosition ||
      oldSelection.endNode.domNode != endNode.domNode ||
      oldSelection.endNode.absolutePosition != endNode.absolutePosition
    ) {
      for (const obs of this.movementObservers) {
        // typescript is confused here, I think because of EmberObjects being weird,
        // but feel free to investigate
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        obs.handleMovement(this, oldSelection, { startNode, endNode });
      }
    }
  }

  /**
   * Execute a command with name commandName. Any extra arguments are passed through to the command.
   * @param commandName
   * @param args
   */
  executeCommand(commandName: string, ...args: unknown[]): unknown {
    const result = super.executeCommand(commandName, ...args);
    return result;
  }

  get currentNode() {
    return this._currentNode;
  }

  set currentNode(node) {
    // clean old marks
    for (const oldNode of document.querySelectorAll(
      '[data-editor-position-level]'
    )) {
      oldNode.removeAttribute('data-editor-position-level');
    }
    // clean old RDFa marks
    for (const oldNode of document.querySelectorAll(
      '[data-editor-rdfa-position-level]'
    )) {
      oldNode.removeAttribute('data-editor-rdfa-position-level');
    }

    // set current node
    this._currentNode = node;

    // add new marks
    let counter = 0;
    let walkedNode = node;
    while (walkedNode && walkedNode != this.rootNode) {
      if (isElement(walkedNode)) {
        counter++;
        walkedNode.setAttribute(
          'data-editor-position-level',
          counter.toString()
        );
      }
      walkedNode = walkedNode.parentNode;
    }
    // add new rdfa marks
    let rdfaCounter = 0;
    walkedNode = node;
    while (walkedNode && walkedNode != this.rootNode) {
      if (isElement(walkedNode)) {
        const isSemanticNode = [
          'about',
          'content',
          'datatype',
          'property',
          'rel',
          'resource',
          'rev',
          'typeof',
        ].find((name) => (walkedNode as Element).hasAttribute(name));
        if (isSemanticNode) {
          rdfaCounter++;
          walkedNode.setAttribute(
            'data-editor-rdfa-position-level',
            rdfaCounter.toString()
          );
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
  get currentSelectionIsACursor() {
    const sel = this.currentSelection;
    return sel[0] === sel[1];
  }

  /**
   * content observers
   * @property contentObservers
   * @private
   */
  contentObservers: Array<ContentObserver> = [];

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
  textInsert() {
    warn('textInsert was called on raw-editor without listeners being set.', {
      id: 'content-editable.invalid-state',
    });
  }

  /**
   * @method moveCaretInTextNode
   * @param textNode
   * @param position
   * @private
   */
  moveCaretInTextNode(textNode: Node, position: number) {
    try {
      const currentSelection = getWindowSelection();
      currentSelection.collapse(textNode, position);
      //not sure if removing this will cause bugs, further testing required
      //this.rootNode.focus();
    } catch (e) {
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
  getRichNodeFor(domNode: Node | null, tree = this.richNode): RichNode | null {
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
    if (type === 'text') return richNode.start + offset;
    else if (type === 'tag') {
      const children = richNode.children;
      if (children && children.length > offset) return children[offset].start;
      else if (children && children.length == offset)
        // this happens and in that case we want to be at the end of that node, but not outside
        return children[children.length - 1].end;
      else if (children) {
        warn(
          `provided offset (${offset}) is invalid for richNode of type tag with ${children.length} children`,
          { id: 'contenteditable-editor.invalid-range' }
        );
        return children[children.length - 1].end;
      } else {
        throw new Error(
          `can't calculate position for richNode of type ${type}`
        );
      }
    } else {
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
  setCurrentPosition(position: number) {
    const richNode = this.richNode;
    if (richNode.end < position || richNode.start > position) {
      warn(
        `received invalid position, resetting to ${richNode.end} end of document`,
        { id: 'contenteditable-editor.invalid-position' }
      );
      position = richNode.end;
    }
    const node = this.findSuitableNodeForPosition(position);
    if (node) {
      this.setCaret(node.domNode, position - node.start);
    } else {
      console.warn(
        "did not receive a suitable node to set cursor, can't set cursor!"
      ); // eslint-disable-line no-console
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
  insertValidCursorNodeAfterRichNode(
    richParent: RichNode,
    richNode: RichNode
  ): RichNode {
    if (
      richNode.domNode.nextSibling === null ||
      richNode.domNode.nextSibling.nodeType !== Node.TEXT_NODE
    ) {
      const newNode = document.createTextNode(INVISIBLE_SPACE);
      return this.insertElementsAfterRichNode(richParent, richNode, [newNode]);
    }
    return walkDomNodeAsText(richNode.domNode.nextSibling);
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
  insertElementsAfterRichNode(
    richParent: RichNode,
    richNode: RichNode,
    remainingElements: ChildNode[]
  ): RichNode {
    if (remainingElements.length == 0) return richNode;

    const nodeToInsert = remainingElements[0];
    (richNode.domNode as ChildNode).after(nodeToInsert);

    const richNodeToInsert = walkDomNodeAsText(nodeToInsert);

    return this.insertElementsAfterRichNode(
      richParent,
      richNodeToInsert,
      remainingElements.slice(1)
    );
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
    if (
      richNode &&
      richNode.start >= currentPosition &&
      richNode.end <= currentPosition
    ) {
      this.setCaret(
        richNode.domNode,
        Math.max(0, currentPosition - richNode.start)
      );
    } else if (oldRichNodecontainingCursor) {
      // domNode containing cursor no longer exists, we have to reset the cursor in a different node
      // first let's try to find a parent that still exists
      let newNode = oldRichNodecontainingCursor;
      while (
        newNode &&
        newNode.domNode !== this.rootNode &&
        !this.rootNode.contains(newNode.domNode)
      ) {
        newNode = newNode.parent;
      }
      // set the currentnode to that parent for better positioning
      this.currentNode = newNode.domNode;
      this.setCurrentPosition(currentPosition);
    } else {
      console.debug(
        'have to guess cursor position, no previous richnode was provided!'
      ); // eslint-disable-line no-console
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
    isDisplayedAsBlock(richNode.domNode);
  }

  isTagWithOnlyABreakAsChild(node: RichNode) {
    const type = node.domNode.nodeType;
    const children = node.children;
    return (
      type === Node.ELEMENT_NODE &&
      children &&
      children.length === 1 &&
      children[0].type === 'tag' &&
      tagName(children[0].domNode) === 'br'
    );
  }

  insertTextNodeWithSpace(
    parent: RichNode,
    relativeToSibling = null,
    after = false
  ) {
    const parentDomNode = parent.domNode;
    const textNode = insertTextNodeWithSpace(
      parentDomNode,
      relativeToSibling,
      after
    );
    this.updateRichNode();
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
  findSuitableNodeInRichNode(
    node: RichNode,
    position: number
  ): RichNode | null {
    if (!node) {
      console.warn('No node provided to findSuitableNodeInRichNode.'); // eslint-disable-line no-console
      return null;
    }

    const appropriateTextNodeFilter = (node: RichNode) =>
      node.start <= position &&
      node.end >= position &&
      node.type === 'text' &&
      !isList(node.parent.domNode);

    const textNodeContainingPosition = flatMap(
      node,
      appropriateTextNodeFilter,
      true
    );
    if (textNodeContainingPosition.length == 1) {
      // We've found a text node! Huzah!
      return textNodeContainingPosition[0];
    } else {
      const elementContainingPosition = flatMap(
        node,
        appropriateTextNodeFilter
      );
      if (elementContainingPosition.length > 0) {
        // We have to guess which element matches, taking the last matching one is a strategy that sort of works.
        // This gives us the deepest/last node matching. It's horrid in the case of consecutive br's for example.
        const newTextNode = nextTextNode(
          elementContainingPosition[elementContainingPosition.length - 1]
            .domNode,
          this.rootNode
        );
        this.updateRichNode();

        return this.getRichNodeFor(newTextNode);
      } else {
        if (node.parent) {
          console.debug(
            `no valid node found for provided position ${position} and richNode, going up one node`,
            node
          ); // eslint-disable-line no-console
          return this.findSuitableNodeInRichNode(node.parent, position);
        } else {
          console.warn(
            `no valid node found for provided position ${position} and richNode`,
            node
          ); // eslint-disable-line no-console
          if (node.domNode === this.rootNode && node.start === node.end) {
            console.debug(`empty editor, creating a textNode`); // eslint-disable-line no-console
            const newNode = document.createTextNode(INVISIBLE_SPACE);
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
    const richNode = this.richNode;
    if (
      currentRichNode &&
      currentRichNode.start <= position &&
      currentRichNode.end >= position
    ) {
      const node = this.findSuitableNodeInRichNode(currentRichNode, position);
      return node;
    } else if (richNode.start <= position && richNode.end >= position) {
      const node = this.findSuitableNodeInRichNode(this.richNode, position);
      return node;
    } else {
      warn(
        `position ${position} is not in range of document ${richNode.start} ${richNode.end}`,
        { id: 'content-editable:not-a-suitable-position' }
      );
      return this.findSuitableNodeForPosition(richNode.end);
    }
  }

  /**
   * create a snapshot for undo history
   * @method createSnapshot
   * @public
   */
  createSnapshot() {
    try {
      const document = {
        content: this.rootNode.innerHTML,
        currentSelection: this.currentSelection,
      };
      this.history.push(document);
    } catch (e) {
      if (e instanceof ModelError) {
        console.info(
          'Failed to create snapshot because of uninitialized model. This is probably fine.'
        );
      } else {
        throw e;
      }
    }
  }

  /**
   * execute a DOM transformation on the editor content, ensures a consistent editor state
   * @method externalDomUpdate
   * @param {String} description
   * @param {function} domUpdate
   * @param {boolean} maintainCursor, keep cursor in place if possible
   * @public
   */
  externalDomUpdate(
    description: string,
    domUpdate?: () => void,
    maintainCursor = false
  ) {
    debug(`executing an external dom update: ${description}`);
    const currentNode = this.currentNode;
    const richNode = this.getRichNodeFor(currentNode);
    if (richNode) {
      const relativePosition = this.getRelativeCursorPosition();
      if (domUpdate) {
        domUpdate();
      }

      this.updateRichNode();
      if (
        maintainCursor &&
        currentNode &&
        isTextNode(currentNode) &&
        this.currentNode === currentNode &&
        this.rootNode.contains(currentNode) &&
        relativePosition &&
        currentNode.length >= relativePosition
      ) {
        this.setCaret(currentNode, relativePosition);
      } else {
        this.updateSelectionAfterComplexInput();
      }
    } else {
      if (domUpdate) {
        domUpdate();
      }

      this.updateRichNode();
      this.updateSelectionAfterComplexInput();
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
      commonAncestor =
        commonAncestor.nodeType === Node.TEXT_NODE
          ? commonAncestor.parentNode!
          : commonAncestor;
      if (this.rootNode.contains(commonAncestor)) {
        if (range.collapsed) {
          this.setCaret(range.startContainer, range.startOffset);
        } else {
          const startNode = this.getRichNodeFor(range.startContainer)!;
          const endNode = this.getRichNodeFor(range.endContainer)!;
          const startPosition = this.calculatePosition(
            startNode,
            range.startOffset
          );
          const endPosition = this.calculatePosition(endNode, range.endOffset);
          const start = {
            relativePosition: startPosition - startNode.start,
            absolutePosition: startPosition,
            domNode: startNode.domNode,
          };
          const end = {
            relativePosition: endPosition - endNode.start,
            absolutePosition: endPosition,
            domNode: endNode.domNode,
          };
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          this.currentSelection = { startNode: start, endNode: end };
        }
      }
    } else {
      warn('no selection found on window', {
        id: 'content-editable.unsupported-browser',
      });
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
      console.debug(
        'tried to set carret, but did not find a matching richNode for',
        node
      ); // eslint-disable-line no-console
      return;
    }
    if (richNode.type === 'tag' && richNode.children) {
      if (richNode.children.length < offset) {
        warn(
          `invalid offset ${offset} for node ${tagName(
            richNode.domNode
          )} with ${richNode.children.toString()} provided to setCaret`,
          { id: 'contenteditable.invalid-start' }
        );
        return;
      }
      const richNodeAfterCarret = richNode.children[offset];
      if (richNodeAfterCarret && richNodeAfterCarret.type === 'text') {
        // the node after the carret is a text node, so we can set the cursor at the start of that node
        const absolutePosition = richNodeAfterCarret.start;
        const position = {
          domNode: richNodeAfterCarret.domNode,
          absolutePosition,
          relativePosition: 0,
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.currentSelection = { startNode: position, endNode: position };
      } else if (offset > 0 && richNode.children[offset - 1].type === 'text') {
        // the node before the carret is a text node, so we can set the cursor at the end of that node
        const richNodeBeforeCarret = richNode.children[offset - 1];
        const absolutePosition = richNodeBeforeCarret.end;
        const position = {
          domNode: richNodeBeforeCarret.domNode,
          absolutePosition,
          relativePosition:
            richNodeBeforeCarret.end - richNodeBeforeCarret.start,
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.currentSelection = { startNode: position, endNode: position };
      } else {
        // no suitable text node is present, so we create a textnode
        let textNode;
        if (richNodeAfterCarret) {
          // insert text node before the offset
          textNode = insertTextNodeWithSpace(
            node,
            richNodeAfterCarret.domNode as ChildNode
          );
        } else if (richNode.children.length === 0 && offset === 0) {
          // the node is empty (no child at position 0), offset should be zero
          // TODO: what if void element?
          textNode = insertTextNodeWithSpace(node);
        } else {
          // no node at offset, insert after the previous node
          textNode = insertTextNodeWithSpace(
            node,
            richNode.children[offset - 1].domNode as ChildNode,
            true
          );
        }
        this.updateRichNode();
        const absolutePosition = this.getRichNodeFor(textNode)!.start;
        const position = {
          domNode: textNode,
          relativePosition: 0,
          absolutePosition,
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.currentSelection = { startNode: position, endNode: position };
      }
    } else if (richNode.type === 'text') {
      const absolutePosition = richNode.start + offset;
      const position = {
        domNode: node,
        absolutePosition,
        relativePosition: offset,
      };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.currentSelection = { startNode: position, endNode: position };
    } else {
      warn(`invalid node ${tagName(node)} provided to setCaret`, {
        id: 'contenteditable.invalid-start',
      });
    }
  }

  getRelativeCursorPosition() {
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

  /**
   * restore a snapshot from undo history
   * @method undo
   * @public
   */
  undo() {
    const previousSnapshot = this.history.pop();
    if (previousSnapshot) {
      this.rootNode.innerHTML = previousSnapshot.content;
      this.updateRichNode();
      this.currentNode = null;
      this.setCurrentPosition(previousSnapshot.currentSelection[0]);
      this.model.read();
    } else {
      warn('no more history to undo', {
        id: 'contenteditable-editor:history-empty',
      });
    }
  }
}
