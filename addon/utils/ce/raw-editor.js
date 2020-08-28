import EmberObject, { get, computed } from '@ember/object';
import { runInDebug, debug, warn } from '@ember/debug';
import { A } from '@ember/array';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import DiffMatchPatch from 'diff-match-patch';
import { walk as walkDomNode } from '@lblod/marawa/node-walker';
import {
  isList,
  isDisplayedAsBlock,
  invisibleSpace,
  insertTextNodeWithSpace,
  insertNodeBAfterNodeA,
  removeNode,
  tagName,
  createElementsFromHTML
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import getRichNodeMatchingDomNode from './get-rich-node-matching-dom-node';
import CappedHistory from './capped-history';
import forgivingAction from './forgiving-action';
import flatMap from './flat-map';
import {
  getTextContent,
  processDomNode as walkDomNodeAsText
} from './text-node-walker';
import previousTextNode from './previous-text-node';
import nextTextNode from './next-text-node';
import {
  unorderedListAction,
  orderedListAction,
  indentAction,
  unindentAction
} from './list-helpers';
import { applyProperty, cancelProperty } from './property-helpers';
import highlightProperty from './highlight-property';
import { analyse as scanContexts } from '@lblod/marawa/rdfa-context-scanner';
import {
  selectCurrentSelection,
  selectHighlight,
  selectContext,
  update,
  replaceDomNode,
  triplesDefinedInResource,
  isEmpty
} from './editor';
import {
  findRichNode,
  findUniqueRichNodes
} from '../rdfa/rdfa-rich-node-helpers';
import classic from 'ember-classic-decorator';

/**
 * raw contenteditable editor, a utility class that shields editor internals from consuming applications.
 *
 * @module contenteditable-editor
 * @class RawEditor
 * @constructor
 * @extends EmberObject
 */
@classic
class RawEditor extends EmberObject {
  /**
   * Called after relevant input. Checks content and calls closureActions when changes detected
   * handleTextInsert, handleTextRemove, handleFullContentUpdate
   * @method generateDiffEvents
   *
   * @param {Array} Optional argument pass info to event consumers.
   * @public
   */
  @task({ restartable: true })
  *generateDiffEvents(extraInfo = []) {
    yield timeout(320);

    let newText = getTextContent(this.get('rootNode'));
    let oldText = this.get('currentTextContent');
    const dmp = new DiffMatchPatch();
    let differences = dmp.diff_main(oldText, newText);
    let pos = 0;
    let textHasChanges = false;

    differences.forEach( ([mode, text]) => {
      if (mode === 1) {
        textHasChanges = true;
        this.set('currentTextContent', oldText.slice(0, pos) + text + oldText.slice(pos, oldText.length));
        this.textInsert(pos, text, extraInfo);
        pos = pos + text.length;
      }
      else if (mode === -1) {
        textHasChanges = true;
        this.set('currentTextContent', oldText.slice(0,pos) + oldText.slice(pos + text.length, oldText.length));
        forgivingAction('textRemove', this)(pos, pos + text.length, extraInfo);
      }
      else {
        pos = pos + text.length;
      }
      oldText = this.get('currentTextContent');
    }, this);

    if(textHasChanges){
      if ( ! extraInfo.some( (x) => x.noSnapshot)) {
        this.createSnapshot();
      }
      forgivingAction('handleFullContentUpdate', this)(extraInfo);
    }
  }

  /**
   * root node of the editor
   * @property rootNode
   * @type DOMNode
   * @protected
   */
  rootNode =  null

  /**
   * a rich representation of the dom tree created with {{#crossLink "NodeWalker"}}NodeWalker{{/crossLink}}
   * @property richNode
   * @type RichNode
   * @protected
   */
  richNode = null

  /**
   * the current selection in the editor
   *
   * @property currentSelection
   * @type Array
   * @protected
   */
  get currentSelection() {
    if (this._currentSelection)
      return [this._currentSelection.startNode.absolutePosition, this._currentSelection.endNode.absolutePosition];
    else
      return [0,0];
  }

  set currentSelection({startNode, endNode}) {
    const oldSelection = this._currentSelection;
    this._currentSelection = {startNode, endNode};
    if (startNode.absolutePosition === endNode.absolutePosition) {
      this.moveCaretInTextNode(startNode.domNode, startNode.relativePosition);
      this.currentNode = startNode.domNode;
    }
    else {
      this.currentNode = null;
    }

    if (!oldSelection || (
      oldSelection.startNode.domNode != startNode.domNode ||
        oldSelection.startNode.absolutePosition != startNode.absolutePosition ||
        oldSelection.endNode.domNode != endNode.domNode ||
        oldSelection.endNode.absolutePosition != endNode.absolutePosition
    )) {
      for (const obs of this.movementObservers) {
        obs.handleMovement(this, oldSelection, {startNode, endNode});
      }
      this.generateDiffEvents.perform();
    }
  }

  registerMovementObserver(observer) {
    this.movementObservers.push(observer);
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
   * the domNode containing our caret
   *
   * __NOTE__: is set to null on a selection that spans nodes
   * @property currentNode
   * @type DOMNode
   * @protected
   */
  _currentNode = null

  get currentNode() {
    return this._currentNode;
  }

  set currentNode( node ) {
    // clean old marks
    for( let oldNode of document.querySelectorAll("[data-editor-position-level]") ) {
      oldNode.removeAttribute("data-editor-position-level");
    }
    // clean old RDFa marks
    for( let oldNode of document.querySelectorAll("[data-editor-rdfa-position-level]") ) {
      oldNode.removeAttribute("data-editor-rdfa-position-level");
    }

    // set current node
    this._currentNode = node;

    // add new marks
    let counter=0;
    let walkedNode = node;
    while( walkedNode && walkedNode != this.rootNode  ) {
      if( tagName( walkedNode ) )
        walkedNode.setAttribute("data-editor-position-level", counter++);
      walkedNode = walkedNode.parentNode;
    }
    // add new rdfa marks
    let rdfaCounter=0;
    walkedNode = node;
    while( walkedNode && walkedNode != this.rootNode ) {
      if( tagName( walkedNode ) ) {
        let isSemanticNode =
            ["about","content","datatype","property","rel","resource","rev","typeof"]
            .find( (name) => walkedNode.hasAttribute(name) );
        if( isSemanticNode )
          walkedNode.setAttribute("data-editor-rdfa-position-level", rdfaCounter++);
      }
      walkedNode = walkedNode.parentNode;
    }
  }

  /**
   * current textContent from editor
   *
   * @property currentTextContent
   * @type String
   * @public
   */
  currentTextContent = null

  /**
   * components present in the editor
   *
   * __NOTE__: this is an experimental feature that might be removed
   * @property components
   * @type {Object}
   * @public
   */
  components = null

  /**
   * is current selection a cursor
   * @property currentSelectionIsACursor
   * @type boolean
   * @public
   */
  @computed('currentSelection')
  get currentSelectionIsACursor() {
    let sel = this.currentSelection;
    return sel[0] === sel[1];
  }

  /**
   * apply a property on the provided selection
   * @method applyProperty
   * @param {Object} selection a selection created using selectHighlight or selectContext
   * @param {EditorProperty} property
   */
  applyProperty(selection, property) {
    applyProperty(selection, this, property);
  }

  /**
   * cancel a property on the provided selection
   * @method cancelProperty
   * @param {Object} selection a selection created using selectHighlight or selectContext
   * @param {EditorProperty} property
   */
  cancelProperty(selection, property) {
    cancelProperty(selection, this, property);
  }

  /**
   * toggle a property on the provided selection
   * @method toggleProperty
   * @param {Object} selection a selection created using selectHighlight or selectContext
   * @param {EditorProperty} property
   */
  toggleProperty(selection, property) {
    const richNodes = selection.selections.map((s) => s.richNode);
    let start, end;
    if (selection.selectedHighlightRange) {
      [start, end] = selection.selectedHighlightRange;
    }
    else {
      start = richNodes.map((n) => n.start).sort()[0];
      end = richNodes.map((n) => n.end).sort().reverse()[0];
    }

    // check if property is enabled on any non empty text node, these are the only visible nodes
    const filteredNodes = richNodes.filter((node) => !(node.start === start && node.end === start)).filter((node) => !(node.start === end && node.end === end));
    const enabled = filteredNodes.some( (node) => node.type === 'text' && property.enabledAt(node));
    if (enabled) {
      this.cancelProperty(selection, property);
    }
    else {
      this.applyProperty(selection, property);
    }
    if (selection.collapsed) {
      // property was toggled on a current cursor position, move cursor to the correct node
      const textNodeAtCurrentPosition = (node) => node.type === 'text' && node.start <= this.currentPosition && node.end >= this.currentPosition;
      const correctNode = flatMap(this.richNode, (node) => textNodeAtCurrentPosition(node) && property.enabledAt(node) !== enabled, true)[0];
      if (correctNode) {
        this.setCaret(correctNode.domNode, this.currentPosition - correctNode.start);
      }
    }
  }

  constructor(){
    super(...arguments);
    this.set('history', CappedHistory.create({ maxItems: 100}));
    this.set('components', A());
    this.movementObservers = A();
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
  replaceTextWithHTML(start, end, html) {
    deprecate('deprecated call to replaceTextWithHTML in rawEditor, please use the pernet api with set.innerHTML');
    this.createSnapshot();
    const selection = this.selectHighlight([start, end]);
    this.update(selection, {set: {innerHTML: html}});
  }

  /**
   * replaces dom node with html string.
   * @method replaceNodeWithHTML
   * @param {Object} DomNode to work on
   * @param {Object} string containing html
   * @param {Boolean} instructive to place cursor after inserted HTML,
   * @param {Array} Optional extra info, which will be passed around when triggering update events.
   *
   * @return returns inserted domNodes (with possibly an extra trailing textNode).
   * @public
   * @deprecated please use RawEditor.update
   */
  replaceNodeWithHTML(node, html, placeCursorAfterInsertedHtml = false, extraInfo = []){
    //TODO: make sure the elements to insert are non empty when not allowed, e.g. <div></div>
    //TODO: think: what if htmlstring is "<div>foo</div><div>bar</div>" -> do we need to force a textnode in between?

    //keeps track of current node.
    let getCurrentCarretPosition = this.getRelativeCursorPosition();
    let currentNode = this.currentNode;

    let keepCurrentPosition = !placeCursorAfterInsertedHtml && !node.isSameNode(currentNode) && !node.contains(currentNode);

    if(!placeCursorAfterInsertedHtml && (node.isSameNode(currentNode) || node.contains(currentNode)))
      warn(`Current node is same or contained by node to replace. Current node will change.`,
           {id: 'contenteditable.replaceNodeWithHTML.currentNodeReplace'});

    //find rich node matching dom node
    let richNode = this.getRichNodeFor(node);
    if(!richNode) return null;

    let richParent = richNode.parent;
    if (!richParent) return null;

    //insert new nodes first
    let domNodesToInsert = createElementsFromHTML(html);

    let lastInsertedRichElement = this.insertElementsAfterRichNode(richParent, richNode, domNodesToInsert);
    lastInsertedRichElement = this.insertValidCursorNodeAfterRichNode(richParent, lastInsertedRichElement);

    // proceed with removal
    removeNode(richNode.domNode);

    //update editor state
    const textNodeAfterInsert = !keepCurrentPosition ? nextTextNode(lastInsertedRichElement.domNode) : null;
    this.updateRichNode();
    this.generateDiffEvents.perform(extraInfo);
    if(keepCurrentPosition) {
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
   * removes a node. If node to be removed is contains current cursor position. The cursor
   * position will be update to a previous sensible node too.
   * @method removeNode
   * @param {Object} DomNode to work on
   * @param {Array} Optional extra info, which will be passed around when triggering update events.
   *
   * @return returns node we ended up in.
   * @public
   * @deprecated please use RawEditor.update
   */
  removeNode(node, extraInfo = []){
    //keeps track of current node.
    let carretPositionToEndIn = this.getRelativeCursorPosition();
    let nodeToEndIn = this.currentNode;
    let keepCurrentPosition = !node.isSameNode(nodeToEndIn) && !node.contains(nodeToEndIn);

    if(!keepCurrentPosition){
      nodeToEndIn = previousTextNode(node, this.rootNode);
      carretPositionToEndIn = nodeToEndIn.length;
    }

    //find rich node matching dom node
    let richNode = this.getRichNodeFor(node);
    if(!richNode) return null;

    // proceed with removal
    removeNode(richNode.domNode);

    this.updateRichNode();
    this.generateDiffEvents.perform(extraInfo);

    this.setCaret(nodeToEndIn, carretPositionToEndIn);

    return nodeToEndIn;
  }

  /**
   * Prepends the children of a node with an html block
   * @method prependChildrenHTML
   * @param {Object} DomNode to work on
   * @param {Object} string containing html
   * @param {Boolean} instructive to place cursor after inserted HTML,
   * @param {Array} Optional extra info, which will be passed around when triggering update events.
   *
   * @return returns inserted domNodes (with possibly an extra trailing textNode).
   * @public
   */
  prependChildrenHTML(node, html, placeCursorAfterInsertedHtml = false, extraInfo = []){
    //TODO: check if node allowed children?
    let getCurrentCarretPosition = this.getRelativeCursorPosition();
    let currentNode = this.currentNode;

    let keepCurrentPosition = !placeCursorAfterInsertedHtml;

    //find rich node matching dom node
    let richParent = this.getRichNodeFor(node);
    if(!richParent) return null;

    //insert new nodes first
    let domNodesToInsert = createElementsFromHTML(html);

    if (domNodesToInsert.length == 0)
      return [ node ];

    let lastInsertedRichElement = this.prependElementsRichNode(richParent, domNodesToInsert);
    lastInsertedRichElement = this.insertValidCursorNodeAfterRichNode(richParent, lastInsertedRichElement);

    //update editor state
    const textNodeAfterInsert = !keepCurrentPosition ? nextTextNode(lastInsertedRichElement.domNode) : null;
    this.updateRichNode();
    this.generateDiffEvents.perform(extraInfo);
    if(keepCurrentPosition) {
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
   * inserts an emtpy textnode after richnode, if non existant.
   *
   * @method insertElementsAfterRichNode
   *
   * @param {RichNode} parent element where the elements should be added.
   * @param {RichNode} last sibling where new elements should occur after
   * @param {Array} array of (DOM) elements to insert
   *
   * @return {RichNode} returns last inserted element as RichNode. That is a rich textNode
   * @private
   */
  insertValidCursorNodeAfterRichNode(richParent, richNode){
    if (richNode.domNode.nextSibling === null || richNode.domNode.nextSibling.nodeType !== Node.TEXT_NODE) {
      let newNode = document.createTextNode(invisibleSpace);
      return this.insertElementsAfterRichNode(richParent, richNode, [newNode]);
    }
    return walkDomNodeAsText(richNode.domNode.nextSibling, richParent.domNode, richNode.end);
  }

  /**
   * Prepends a list of elements to children
   *
   * @method prependElementsRichNode
   *
   * @param {RichNode} parent element where the elements should be added.
   * @param {Array} array of (DOM) elements to insert
   *
   * @return {RichNode} returns last inserted element as RichNode
   * @private
   */
  prependElementsRichNode(richParent, elements){
    let newFirstChild = elements[0];
    if(richParent.domNode.firstChild)
      richParent.domNode.insertBefore(newFirstChild, richParent.domNode.firstChild);
    else
      richParent.domNode.appendChild(newFirstChild);

    let newFirstRichChild = walkDomNodeAsText(newFirstChild, richParent.domNode, richParent.start);
    return this.insertElementsAfterRichNode(richParent, newFirstRichChild, elements.slice(1));
  }

  /**
   * Inserts an array of elements into the editor.
   *
   * @method insertElementsAfterRichNode
   *
   * @param {RichNode} parent element where the elements should be added.
   * @param {RichNode} last sibling where new elements should occur after
   * @param {Array} array of (DOM) elements to insert
   *
   * @return {RichNode} returns last inserted element as RichNode
   * @private
   */
  insertElementsAfterRichNode(richParent, richNode, remainingElements){
    if( remainingElements.length == 0 )
      return richNode;

    let nodeToInsert = remainingElements[0];

    insertNodeBAfterNodeA(richParent.domNode, richNode.domNode, nodeToInsert);

    let richNodeToInsert = walkDomNodeAsText(nodeToInsert, richParent.domNode, richNode.end);

    return this.insertElementsAfterRichNode(richParent, richNodeToInsert, remainingElements.slice(1));
  }

  /**
   * Higlight a section of the editor text
   *
   * @method highlightRange
   *
   * @param {number} start Start of the region
   * @param {number} end End of the region
   * @param {Object} data map of data to be included on the highlight, can be used to add rdfa or data- attributes
   * @public
   */
  highlightRange(start, end, data = {}) {
    if( data && Object.entries(data).length != 0 ) {
      warn( "Data attributes were supplied to highlightRange but this is not supported at the moment", {id: "content-editable.highlight"} );
    }
    // NOTE: we assume applying a highlight does not update any text ranges, e.g. start and end of all nodes remains the same
    // TODO: this entire function seems to assume a position and not a selection
    const richNodeContainingCursor = this.getRichNodeFor(this.currentNode) || this.findSuitableNodeForPosition(this.currentPosition);
    const selection = this.selectHighlight([start,end]);
    applyProperty(selection, this, highlightProperty); // TODO: replace 'this' with proper interface
    // reset the cursor so the browser shows cursor in the correct position
    this.resetCursor(richNodeContainingCursor);
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
  resetCursor(oldRichNodecontainingCursor) {
    const richNode = this.getRichNodeFor(this.currentNode);
    const currentPosition = this.currentSelection[1];
    if (richNode && richNode.start >= currentPosition && richNode.end <= currentPosition) {
      this.setCaret(richNode.domNode, Math.max(0,currentPosition - richNode.start));
    }
    else if(oldRichNodecontainingCursor) {
      // domNode containing cursor no longer exists, we have to reset the cursor in a different node
      // first let's try to find a parent that still exists
      let newNode = oldRichNodecontainingCursor;
      while (newNode && ! newNode.domNode == this.rootNode && !this.rootNode.contains(newNode.domNode)) {
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
   * Clear the highlights contained in a specified range
   *
   * @method clearHightlightForRange
   *
   * @param {number} start Start of the range
   * @param {number} end End of the range
   *
   * @public
   */
  clearHighlightForRange(start,end) {
    deprecate('deprecated call to clearHightlightForRange, use clearHighlightForLocations');
    this.clearHighlightForLocations([start, end]);
  }

  /**
   * Given a list of locations, clear the linked highlight
   *
   * @method clearHighlightForLocations
   *
   * @param {Array} [[start, end], ...,[start, end]]
   *
   * @public
   */
  clearHighlightForLocations(locations){
    const currentNode = this.getRichNodeFor(this.currentNode);
    for (let location of locations) {
      cancelProperty(this.selectHighlight(location), this, highlightProperty); // todo: replace 'this' with proper interface
    }
    this.resetCursor(currentNode);
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
  isDisplayedAsBlock(richNode) {
    isDisplayedAsBlock(get(richNode, 'domNode'));
  }

  /**
   * Informs the consumer that the text was inserted at the given
   * position.
   *
   * Others can set it on this component, but we are the only ones to
   * call it.
   *
   * @param {number} position Index of the inserted text.
   * @param {String} text Text content that has been inserted.
   */
  textInsert( /*position, text*/ ) {
    warn("textInsert was called on raw-editor without listeners being set.", { id: 'content-editable.invalid-state'});
  }

  /**
   * insert a component at the provided position
   * @method insertComponent
   * @param {Number} position
   * @param {String} componentName
   * @param {Object} componentContent
   * @return {String} componentID
   * @public
   */
  insertComponent(position, name, content, id = uuidv4()) {
    var el;
    if (position instanceof Element)
      el = position;
    else
      [el] = this.replaceTextWithHTML(position, position, `<div contenteditable="false" id="editor-${id}"><!-- component ${id} --></div>`);
    let config = { id, element: el, name, content: EmberObject.create(content) };
    this.components.pushObject(config);
    this.updateRichNode();
    this.updateSelectionAfterComplexInput();
    return id;
  }

  /**
   * remove a component
   * @method removeComponent
   * @param {String} componentID
   * @public
   */
  removeComponent(id) {
    let item = this.components.find( (item) => item.id === id);
    this.components.removeObject(item);
    this.updateRichNode();
    this.updateSelectionAfterComplexInput();
  }

  isTagWithOnlyABreakAsChild(node) {
    let type = node.domNode.nodeType;
    let children = get(node, 'children');
    return (type === Node.ELEMENT_NODE &&
            children.length === 1 &&
            get(children[0], 'type') === 'tag' &&
            tagName(get(children[0], 'domNode')) === 'br'
           );
  }

  insertTextNodeWithSpace(parent, relativeToSibling = null, after = false) {
    let parentDomNode = get(parent, 'domNode');
    let textNode = insertTextNodeWithSpace(parentDomNode, relativeToSibling, after);
    this.updateRichNode();
    this.generateDiffEvents.perform([{noSnapshot: true}]);
    return this.getRichNodeFor(textNode);
  }


  /**
   * determines best suitable node to position caret in for provided rich node and position
   * creates a text node if necessary
   * @method findSuitableNodeInRichNode
   * @param {RichNode} node
   * @param {number} position
   * @return {RichNode}
   * @private
   */
  findSuitableNodeInRichNode(node, position) {
    if (!node) {
      console.warn('no node provided to findSuitableNodeinRichNode'); // eslint-disable-line no-console
      return null;
    }
    const appropriateTextNodeFilter = node =>
        node.start <= position && node.end >= position
          && node.type === 'text'
          && ! isList(node.parent.domNode);
    let textNodeContainingPosition = flatMap(node, appropriateTextNodeFilter, true);
    if (textNodeContainingPosition.length == 1) {
      // we've found a text node! huzah!
      return textNodeContainingPosition[0];
    }
    else {
      const elementContainingPosition = flatMap(node, appropriateTextNodeFilter);
      if (elementContainingPosition.length > 0) {
        // we have to guess which element matches, taking the last matching one is a strategy that sort of works
        // this gives us the deepest/last node matching. it's horrid in the case of consecutive br's for example
        const newTextNode = nextTextNode(elementContainingPosition[elementContainingPosition.length - 1]);
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
            let newNode = document.createTextNode(invisibleSpace);
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
  findSuitableNodeForPosition(position) {
    let currentRichNode = this.getRichNodeFor(this.currentNode);
    let richNode = this.get('richNode');
    if (currentRichNode && get(currentRichNode, 'start') <= position && get(currentRichNode, 'end') >= position) {
      let node = this.findSuitableNodeInRichNode(currentRichNode, position);
      return node;
    }
    else if (get(richNode, 'start') <= position && get(richNode, 'end') >= position){
      let node = this.findSuitableNodeInRichNode(this.get('richNode'),position);
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
    let document = {
      content: this.get('rootNode').innerHTML,
      currentSelection: this.currentSelection
    };
    this.get('history').push(document);
  }

  /**
   * @method updateRichNode
   * @private
   */
  updateRichNode() {
    const richNode = walkDomNode( this.rootNode );
    this.set('richNode', richNode);
  }

  /**
   * restore a snapshot from undo history
   * @method undo
   * @public
   */
  undo() {
    let previousSnapshot = this.get('history').pop();
    if (previousSnapshot) {
      this.get('rootNode').innerHTML = previousSnapshot.content;
      this.updateRichNode();
      this.set('currentNode', null);
      this.setCurrentPosition(previousSnapshot.currentSelection[0]);
      this.generateDiffEvents.perform([{noSnapshot: true}]);
    }
    else {
      warn('no more history to undo', {id: 'contenteditable-editor:history-empty'});
    }
  }

  /**
   * @method moveCaretInTextNode
   * @param {TEXTNode} textNode
   * @param {number} position
   * @private
   */
  moveCaretInTextNode(textNode, position){
    try {
      let currentSelection = window.getSelection();
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
   * @param {DOMNode} node
   *
   * @return {RichNode} node
   *
   * @private
   */
  getRichNodeFor(domNode, tree = this.get('richNode')) {
    return getRichNodeMatchingDomNode(domNode, tree);
  }

  /**
   * execute a DOM transformation on the editor content, ensures a consistent editor state
   * @method externalDomUpdate
   * @param {String} description
   * @param {function} domUpdate
   * @param {boolean} maintainCursor, keep cursor in place if possible
   * @public
   */
  externalDomUpdate(description, domUpdate, maintainCursor = false) {
    debug(`executing an external dom update: ${description}`, {id: 'contenteditable.external-dom-update'} );
    const currentNode = this.currentNode;
    const richNode = this.getRichNodeFor(currentNode);
    if (richNode) {
      const relativePosition = this.getRelativeCursorPosition();
      domUpdate();
      this.updateRichNode();
      if (maintainCursor &&
          this.currentNode === currentNode &&
          this.rootNode.contains(currentNode) &&
          currentNode.length >= relativePosition) {
        this.setCaret(currentNode,relativePosition);
      }
      else {
        this.updateSelectionAfterComplexInput();
      }
      forgivingAction('elementUpdate', this)();
      this.generateDiffEvents.perform();
    }
    else {
      domUpdate();
      this.updateRichNode();
      this.updateSelectionAfterComplexInput();
      forgivingAction('elementUpdate', this)();
      this.generateDiffEvents.perform();
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
    let windowSelection = window.getSelection();
    if (windowSelection.rangeCount > 0) {
      let range = windowSelection.getRangeAt(0);
      let commonAncestor = range.commonAncestorContainer;
      // IE does not support contains for text nodes
      commonAncestor = commonAncestor.nodeType === Node.TEXT_NODE ? commonAncestor.parentNode : commonAncestor;
      if (this.get('rootNode').contains(commonAncestor)) {
        if (range.collapsed) {
          this.setCaret(range.startContainer, range.startOffset);
        }
        else {
          let startNode = this.getRichNodeFor(range.startContainer);
          let endNode = this.getRichNodeFor(range.endContainer);
          let startPosition = this.calculatePosition(startNode, range.startOffset);
          let endPosition = this.calculatePosition(endNode, range.endOffset);
          let start = {relativePosition: startPosition - startNode.start, absolutePosition: startPosition, domNode: startNode.domNode};
          let end = { relativePosition: endPosition - endNode.start, absolutePosition: endPosition, domNode: endNode.domNode};
          this.currentSelection = { startNode: start , endNode: end };
        }
      }
    }
    else {
      warn('no selection found on window',{ id: 'content-editable.unsupported-browser'});
    }
  }

  /**
   * calculate the cursor position based on a richNode and an offset from a domRANGE
   * see https://developer.mozilla.org/en-US/docs/Web/API/Range/endOffset and
   * https://developer.mozilla.org/en-US/docs/Web/API/Range/startOffset
   *
   * @method calculatePosition
   * @param {RichNode} node
   * @param {Number} offset
   * @private
   */
  calculatePosition(richNode, offset) {
    let type = richNode.type;
    if (type === 'text')
      return richNode.start + offset;
    else if (type === 'tag') {
      let children = richNode.children;
      if (children && children.length > offset)
        return children[offset].start;
      else if (children && children.length == offset)
        // this happens and in that case we want to be at the end of that node, but not outside
        return children[children.length -1 ].end;
      else {
        warn(`provided offset (${offset}) is invalid for richNode of type tag with ${children.length} children`, {id: 'contenteditable-editor.invalid-range'});
        return children[children.length -1 ].end;
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
   * @param {number} position of the range
   * @param {boolean} notify observers, default true
   * @public
   */
  setCurrentPosition(position, notify = true) {
    let richNode = this.richNode;
    if (richNode.end < position || richNode.start > position) {
      warn(`received invalid position, resetting to ${richNode.end} end of document`, {id: 'contenteditable-editor.invalid-position'});
      position = get(richNode, 'end');
    }
    let node = this.findSuitableNodeForPosition(position);
    if (node) {
      this.setCaret(node.domNode, position - node.start, notify);
    }
    else {
      console.warn('did not receive a suitable node to set cursor, can\'t set cursor!'); // eslint-disable-line no-console
    }
  }

  getRelativeCursorPosition(){
    let currentRichNode = this.getRichNodeFor(this.currentNode);
    if (currentRichNode) {
      let absolutePos = this.currentSelection[0];
      return absolutePos - currentRichNode.start;
    }
    return null;
  }

  getRelativeCursorPostion() {
    return this.getRelativeCursorPosition();
  }


  /**
   * set the carret on the desired position. This function ensures a text node is present at the requested position
   *
   * @method setCaret
   * @param {DOMNode} node, a text node or dom element
   * @param {number} offset, for a text node the relative offset within the text node (i.e. number of characters before the carret).
   *                         for a dom element the number of childnodes before the carret.
   * @return {DOMNode} currentNode of the editor after the operation
   * Examples:
   *     to set the carret after 'c' in a textnode with text content 'abcd' use setCaret(textNode,3)
   *     to set the carret after the end of a node with innerHTML `<b>foo</b><span>work</span>` use setCaret(element, 2) (e.g setCaret(element, element.children.length))
   *     to set the carret after the b in a node with innerHTML `<b>foo</b><span>work</span>` use setCaret(element, 1) (e.g setCaret(element, indexOfChild + 1))
   *     to set the carret after the start of a node with innerHTML `<b>foo</b><span>work</span>` use setCaret(element, 0)
   *
   * @public
   */
  setCaret(node, offset) {
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
        this.currentSelection = { startNode: position, endNode: position};
      }
      else if (offset > 0 && richNode.children[offset-1].type === 'text') {
        // the node before the carret is a text node, so we can set the cursor at the end of that node
        const richNodeBeforeCarret = richNode.children[offset-1];
        const absolutePosition = richNodeBeforeCarret.end;
        const position = {domNode: richNodeBeforeCarret.domNode, absolutePosition, relativePosition: richNodeBeforeCarret.end - richNodeBeforeCarret.start};
        this.currentSelection = { startNode: position, endNode: position};
      }
      else {
        // no suitable text node is present, so we create a textnode
        var textNode;
        if (richNodeAfterCarret){ // insert text node before the offset
          textNode = insertTextNodeWithSpace(node, richNodeAfterCarret.domNode);
        }
        else if  (richNode.children.length === 0 && offset === 0) { // the node is empty (no child at position 0), offset should be zero
          // TODO: what if void element?
          textNode = insertTextNodeWithSpace(node);
        }
        else { // no node at offset, insert after the previous node
          textNode = insertTextNodeWithSpace(node, richNode.children[offset-1].domNode, true);
        }
        this.updateRichNode();
        const absolutePosition = this.getRichNodeFor(textNode).start;
        const position = {domNode: textNode, relativePosition: 0, absolutePosition};
        this.currentSelection = { startNode: position, endNode: position};
      }
    }
    else if (richNode.type === 'text') {
      const absolutePosition = richNode.start + offset;
      const position = {domNode: node, absolutePosition, relativePosition: offset};
      this.currentSelection = { startNode: position, endNode: position };
    }
    else {
      warn(`invalid node ${tagName(node.domNode)} provided to setCaret`, {id: 'contenteditable.invalid-start'});
    }
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

  /* Potential methods for the new API */
  getContexts(options) {
    const {region} = options || {};
    if( region )
      return scanContexts( this.rootNode, region );
    else
      return scanContexts( this.rootNode );
  }

  /**
   * Pernet API
   * TODO: remove these methods once plugins switched to the new editor
   */
  selectCurrentSelection() {
    return selectCurrentSelection.bind(this)(...arguments);
  }
  selectHighlight() {
    return selectHighlight.bind(this)(...arguments);
  }
  selectContext() {
    return selectContext.bind(this)(...arguments);
  }
  update() {
    this.createSnapshot();
    return update.bind(this)(...arguments);
  }
  replaceDomNode() {
    this.createSnapshot();
    return replaceDomNode.bind(this)(...arguments);
  }
  triplesDefinedInResource() {
    return triplesDefinedInResource.bind(this)(...arguments);
  }
  isEmpty() {
    return isEmpty.bind(this)(...arguments);
  }

  /**
   * Helpers
   */
  findRichNode() {
    return findRichNode.bind(this)(...arguments);
  }
  findUniqueRichNodes() {
    return findUniqueRichNodes.bind(this)(...arguments);
  }
}

function deprecate(message) {
  runInDebug( () => console.trace(`DEPRECATION: ${message}`)); // eslint-disable-line no-console
}
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => {
    return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16);
  });
}
export default RawEditor;
