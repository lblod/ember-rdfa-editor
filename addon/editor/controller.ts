import { debug, warn } from '@ember/debug';
import { RawEditor, RichNode } from '@lblod/ember-rdfa-editor/editor/raw-editor';
import { moveCaret } from '@lblod/ember-rdfa-editor/editor/utils';
import {
  isEmpty, replaceDomNode, selectContext, selectCurrentSelection,
  selectHighlight, triplesDefinedInResource, update
} from '@lblod/ember-rdfa-editor/utils/ce/editor';
import highlightProperty from '@lblod/ember-rdfa-editor/utils/ce/highlight-property';
import {
  indentAction, orderedListAction,
  unindentAction, unorderedListAction
} from '@lblod/ember-rdfa-editor/utils/ce/list-helpers';
import { applyProperty, cancelProperty } from '@lblod/ember-rdfa-editor/utils/ce/property-helpers';
import { getTextContent } from '@lblod/ember-rdfa-editor/utils/ce/text-node-walker';
import { invisibleSpace, isList } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { determinePosition, rangeToAbsoluteRegion } from '@lblod/ember-rdfa-editor/utils/selection-helpers';
import { analyse as scanContexts } from '@lblod/marawa/rdfa-context-scanner';
import { walk as walkDomNode } from '@lblod/marawa/node-walker';
import DiffMatchPatch from 'diff-match-patch';
import { TaskGenerator, timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import { PernetSelection } from '@lblod/ember-rdfa-editor/editor/pernet';
import { ensureValidTextNodeForCaret } from '@lblod/ember-rdfa-editor/editor/utils';
import { findRichNode, findUniqueRichNodes } from '@lblod/ember-rdfa-editor/utils/rdfa/rdfa-rich-node-helpers';
import CappedHistory from '@lblod/ember-rdfa-editor/utils/ce/capped-history';
import EditorProperty from '@lblod/ember-rdfa-editor/utils/ce/editor-property';
import flatMap from '@lblod/ember-rdfa-editor/utils/ce/flat-map';
import getRichNodeMatchingDomNode from '@lblod/ember-rdfa-editor/utils/ce/get-rich-node-matching-dom-node';
import nextTextNode from '@lblod/ember-rdfa-editor/utils/ce/next-text-node';

interface HistoryItem {
  content: string
  currentSelection: [number, number]
}
interface History {
  pop: () => HistoryItem
  push: (item: HistoryItem) => void
}

interface EditorSelection {
  absoluteRegion: [number, number]
  range: Range
}

export interface MovementObserver {
  handleMovement: (editor: RawEditor, oldSelection: EditorSelection, newSelection: EditorSelection) => void
}

export interface ContentObserver {
  handleTextInsert: (position: number, text: String, extraInfo: Array<Object>) => void
  handleTextRemoval: (start: number, end: number, extraInfo: Array<Object>) => void
  handleFullContentUpdate: (extraInfo: Array<Object>) => void
}

export default class EditorController implements RawEditor {

  get() {
    console.trace('WARNING: this.get no longer exists on editor controller');
  }

  /**
   * root node of the editor
   * @property rootNode
   * @protected
   */
  rootNode: HTMLElement

  /**
   * a rich representation of the dom tree created with {{#crossLink "NodeWalker"}}NodeWalker{{/crossLink}}
   * @property richNode
   * @protected
   */
  richNode: RichNode

  /**
   * history book of the editor
   * @property history
   * @private
   */
  history: History

  /**
   * movement observers
   * @property movementObservers
   * @private
   */
  movementObservers: Array<MovementObserver> = []

  /**
   * content observers
   * @property contentObservers
   * @private
   */
  contentObservers: Array<ContentObserver> = []

  /**
   * internal representation of a selection, includes a mapping to an absolute region within the text content of the editor
   * @property _currentSelection
   * @private
   */
  _currentSelection: EditorSelection | null = null

  /**
   * text content of the editor
   * @property currentTextContent
   * @private
   */
  currentTextContent: string = '';

  /**
   * the region of text that is selected.
   * The location is calculated based on the start and end position of the RichNode's that contain the text
   */
  get currentSelection(): [number, number] {
    return this._currentSelection ? this._currentSelection.absoluteRegion : [0, 0];
  }

  /**
   * the start of the current range
   *
   * @property currentPosition
   * @public
   * @deprecate
   */
  get currentPosition() {
    return this.currentSelection[0];
  }
  /**
   * if the current selection is collapsed return the anchorNode or null otherwise
   * @deprecate
   */
  get currentNode(): HTMLElement | Text | null {
    const selection = this._currentSelection
    if (selection && selection.range.collapsed) {
      return selection.range.startContainer;
    }
    else {
      return null;
    }
  }

  /**
   * is the current selection collapsed
   * @deprecate
   */
  get currentSelectionIsACursor(): boolean {
    const selection = window.getSelection();
    return !!(selection && selection.isCollapsed);
  }

  constructor(rootNode: HTMLElement) {
    this.rootNode = rootNode;
    this.history = new CappedHistory({ maxItems: 100 });
    this.richNode = walkDomNode(this.rootNode);
    this.setCaret(this.rootNode, 0);
  }

  updateCurrentSelection(range: Range) {
    const clonedRange = range.cloneRange();
    const absoluteRegion = rangeToAbsoluteRegion(clonedRange, this.richNode);
    if (absoluteRegion) {
      let differsFromPreviousRange;
      if (this._currentSelection?.range)
        differsFromPreviousRange = range.compareBoundaryPoints(Range.END_TO_END, this._currentSelection.range);
      else
        differsFromPreviousRange = 1;
      const oldSelection = this._currentSelection;
      this._currentSelection = { absoluteRegion, range: clonedRange };
      if (differsFromPreviousRange) {
        for (let obs of this.movementObservers) {
          obs.handleMovement(this, oldSelection, this._currentSelection);
        }
      }
    }
    else {
      console.warn(`could not determine absolute range from provided range`); //eslint-disable-no-console
    }
  }

  /**
   * register a movement observer
   * @method registerMovementObserver
   * @public
   */
  registerMovementObserver(observer: MovementObserver) {
    this.movementObservers.push(observer);
  }

  /**
   * unregister a movement observer
   * @method unregisterMovementObserver
   * @public
   */
  unregisterMovementObserver(observer: MovementObserver) {
    const index = this.movementObservers.indexOf(observer);
    if (index >= 0) {
      this.movementObservers.splice(index, 1);
    }
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
   * create a snapshot for undo history
   * @method createSnapshot
   * @public
   */
  createSnapshot() {
    let document = {
      content: this.rootNode.innerHTML,
      currentSelection: this.currentSelection
    };
    this.history.push(document);
  }

  /**
   * restore a snapshot from undo history
   * @method undo
   * @public
   */
  undo() {
    let previousSnapshot = this.history.pop();
    if (previousSnapshot) {
      this.rootNode.innerHTML = previousSnapshot.content;
      this.updateRichNode();
      this.setCurrentPosition(previousSnapshot.currentSelection[0]);
      taskFor(this.generateDiffEvents).perform([{ noSnapshot: true }]);
    }
    else {
      warn('no more history to undo', { id: 'contenteditable-editor:history-empty' });
    }
  }

  /**
   * @method updateRichNode
   * @public
   */
  updateRichNode(): void {
    this.richNode = walkDomNode(this.rootNode);
  }


  /**
   * set the carret on the desired position. This function ensures the caret is visible at the requested position
   * when required it may create extra text nodes to enforce this
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
  setCaret(node: Node, offset: number): void {
    if (this.rootNode.contains(node)) {
      if (node.nodeType == Node.TEXT_NODE) {
        this.setCaretInText(node as Text, offset);
      }
      else if (node.nodeType == Node.ELEMENT_NODE) {
        this.setCaretInElement(node as HTMLElement, offset);
      }
      else {
        // unsupported type
        console.trace(`provided node of type ${node.nodeType} to setCaret is not a supported`, node); // eslint-disable-line no-console
      }
    }
    else {
      console.trace(`will not set caret in node that isn't contained inside the editor`, node); // eslint-disable-line no-console
    }
  }

  /**
   * set the carret on the desired position. This function ensures the caret is visible at the requested position
   * when required it may create extra text nodes to enforce this
   *
   * @method setCaretInText
   * @param {TextNode} text, a text node
   * @param {number} offset, for a text node the relative offset within the text node (i.e. number of characters before the carret).
   *                         for a dom element the number of childnodes before the carret.
   * @return {DOMNode} currentNode of the editor after the operation
   * Examples:
   *     to set the carret before 'a' in a textnode with text content 'abcd' use setCaret(textNode,0)
   *     to set the carret after 'c' in a textnode with text content 'abcd' use setCaret(textNode,3)
   *     to set the carret after 'd' in a textnode with text content 'abcd' use setCaret(textNode,4)
   *
   * @private
   */
  setCaretInText(text: Text, offset: number): void {
    ensureValidTextNodeForCaret(text);
    moveCaret(text, offset);
    this.updateRichNode();
    const range = window.getSelection()?.getRangeAt(0);
    if (range) {
      this.updateCurrentSelection(range);
    }
  }


    /**
   * set the carret on the desired position. This function ensures the caret is visible at the requested position
   * when required it may create extra text nodes to enforce this
   *
   * @method setCaretInElement
   * @param {HTMLElement} element, a element
   * @param {number} offset, for a text node the relative offset within the text node (i.e. number of characters before the carret).
   *                         for a dom element the number of childnodes before the carret.
   * @return {DOMNode} currentNode of the editor after the operation
   * Examples:
   *     to set the carret after the end of a node with innerHTML `<b>foo</b><span>work</span>` use setCaret(element, 2) (e.g setCaret(element, element.children.length))
   *     to set the carret after the b in a node with innerHTML `<b>foo</b><span>work</span>` use setCaret(element, 1) (e.g setCaret(element, indexOfChild + 1))
   *     to set the carret after the start of a node with innerHTML `<b>foo</b><span>work</span>` use setCaret(element, 0)
   *
   * @private
   */
  setCaretInElement(element: HTMLElement, offset: number): void {
    if (element.childNodes[offset - 1] && element.childNodes[offset - 1].nodeType == Node.TEXT_NODE) {
      // node before provided position is a text node, place cursor at end of that node
      const textNode = element.childNodes[offset - 1] as Text;
      ensureValidTextNodeForCaret(textNode);
      moveCaret(textNode, textNode.length);
    }
    else if (element.childNodes[offset] && element.childNodes[offset].nodeType == Node.TEXT_NODE) {
      // node after provided position is a text node, place cursor at start of that node
      const textNode = element.childNodes[offset] as Text;
      ensureValidTextNodeForCaret(textNode);
      moveCaret(textNode, 0);
    }
    else if (offset == 0) {
      // start of the element, no text node after
      const textNode = document.createTextNode(invisibleSpace);
      element.prepend(textNode);
      moveCaret(textNode, 0);
    }
    else {
      // requested a position not adjacent to a text node
      const nodeBeforeCursor = element.childNodes[offset - 1];
      const textNode = document.createTextNode(invisibleSpace);
      nodeBeforeCursor.after(textNode);
      moveCaret(textNode, 0);
    }
    this.updateRichNode();
    const range = window.getSelection()?.getRangeAt(0);
    if (range) {
      this.updateCurrentSelection(range);
    }
  }

  /**
   * Called after relevant input. Checks content and calls content observers when changes are detected
   * @method generateDiffEvents
   *
   * @param {Array} Optional argument pass info to event consumers.
   * @public
   */
  @task({ restartable: true })
  * generateDiffEvents(extraInfo: Array<Object> = []): TaskGenerator<void> {
    yield timeout(320);

    let newText = getTextContent(this.rootNode);
    let oldText = this.currentTextContent;
    const dmp = new DiffMatchPatch();
    let differences = dmp.diff_main(oldText, newText);
    let pos = 0;
    let textHasChanges = false;
    const contentObservers = this.contentObservers;
    for (let [mode, text] of differences) {
      if (mode === 1) {
        textHasChanges = true;
        this.currentTextContent = oldText.slice(0, pos) + text + oldText.slice(pos, oldText.length);
        for (let observer of contentObservers) {
          observer.handleTextInsert(pos, text, extraInfo);
        }
        pos = pos + text.length;
      }
      else if (mode === -1) {
        textHasChanges = true;
        this.currentTextContent = oldText.slice(0, pos) + oldText.slice(pos + text.length, oldText.length);
        for (let observer of contentObservers) {
          observer.handleTextRemoval(pos, pos + text.length, extraInfo);
        }
      }
      else {
        pos = pos + text.length;
      }
      oldText = this.currentTextContent;
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
   * @deprecate
   */
  getRelativeCursorPosition(): number | null {
    const range = this._currentSelection?.range;
    if (range && range.collapsed) {
      return range.startOffset;
    }
    else {
      return null;
    }
  }

  /**
   * get richnode matching a DOMNode
   *
   * @method getRichNodeFor
   * @param {DOMNode} node
   * @return {RichNode} node
   * @deprecate
   * @private
   */
  getRichNodeFor(domNode: Node | null, tree: RichNode = this.richNode): RichNode | null {
    if (domNode)
      return getRichNodeMatchingDomNode(domNode, tree);
    else
      return null;
  }

  /**
 * update the selection based on dom window selection
 * to be used when we are unsure what sort of input actually happened
 *
 * @method updateSelectionAfterComplexInput
 * @private
 */
  updateSelectionAfterComplexInput(): void {
    let windowSelection = window.getSelection();
    if (windowSelection && windowSelection.rangeCount > 0) {
      let range = windowSelection.getRangeAt(0);
      if (this.rootNode.contains(range.commonAncestorContainer)) {
        if (range.collapsed) {
          // for a caret ensure text node when required
          this.setCaret(range.startContainer, range.startOffset);
        }
        else {
          this.updateCurrentSelection(range);
        }
      }
    }
    else {
      warn('no selection found on window', { id: 'content-editable.unsupported-browser' });
    }
  }

  /**
   * calculate the cursor position based on a richNode and an offset from a domRANGE
   * see https://developer.mozilla.org/en-US/docs/Web/API/Range/endOffset and
   * https://developer.mozilla.org/en-US/docs/Web/API/Range/startOffset
   *
   * @method calculatePosition
   * @deprecate prefer util
   * @private
   */
  calculatePosition(richNode: RichNode, offset: number): number {
    return determinePosition(richNode, offset);
  }

  /**
   * TOOLBAR functions
   * TODO: remove once toolbar is abstracted
   */
  insertUL(): void {
    unorderedListAction(this);
  }

  insertOL(): void {
    orderedListAction(this);
  }

  insertIndent(): void {
    indentAction(this);
  }

  insertUnindent(): void {
    unindentAction(this);
  }

  /**
   * properties (bold, italic, underline, highlight, ...)
   */

  /**
   * apply a property on the provided selection
   * @method applyProperty
   * @param {Object} selection a selection created using selectHighlight or selectContext
   * @param {EditorProperty} property
   */
  applyProperty(selection: PernetSelection, property: EditorProperty) {
    applyProperty(selection, this, property);
  }

  /**
   * cancel a property on the provided selection
   * @method cancelProperty
   * @param {Object} selection a selection created using selectHighlight or selectContext
   * @param {EditorProperty} property
   */
  cancelProperty(selection: PernetSelection, property: EditorProperty) {
    cancelProperty(selection, this, property);
  }

  /**
   * toggle a property on the provided selection
   * @method toggleProperty
   * @param {Object} selection a selection created using selectHighlight or selectContext
   * @param {EditorProperty} property
   */
  toggleProperty(selection: PernetSelection, property: EditorProperty) {
    const richNodes = selection.selections.map((s) => s.richNode);
    let start: number, end: number;
    if (selection.selectedHighlightRange) {
      [start, end] = selection.selectedHighlightRange;
    }
    else {
      start = richNodes.map((n) => n.start).sort()[0];
      end = richNodes.map((n) => n.end).sort().reverse()[0];
    }

    // check if property is enabled on any non empty text node, these are the only visible nodes
    const filteredNodes = richNodes.filter((node) => !(node.start === start && node.end === start)).filter((node) => !(node.start === end && node.end === end));
    const enabled = filteredNodes.some((node) => node.type === 'text' && property.enabledAt(node));
    if (enabled) {
      this.cancelProperty(selection, property);
    }
    else {
      this.applyProperty(selection, property);
    }
    if (selection.collapsed) {
      // property was toggled on a current cursor position, move cursor to the correct node
      const textNodeAtCurrentPosition = (node: RichNode) => node.type === 'text' && node.start <= this.currentPosition && node.end >= this.currentPosition;
      const correctNode = flatMap(this.richNode, (node: RichNode) => textNodeAtCurrentPosition(node) && property.enabledAt(node) !== enabled, true)[0];
      if (correctNode) {
        this.setCaret(correctNode.domNode, this.currentPosition - correctNode.start);
      }
    }
  }

  /**
   * highlights
   */
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
  highlightRange(start: number, end: number, data = {}): void {
    if (data && Object.entries(data).length != 0) {
      warn("Data attributes were supplied to highlightRange but this is not supported at the moment", { id: "content-editable.highlight" });
    }
    // NOTE: we assume applying a highlight does not update any text ranges, e.g. start and end of all nodes remains the same
    // TODO: this entire function seems to assume a position and not a selection
    const selection = this.selectHighlight([start, end]);
    applyProperty(selection, this, highlightProperty); // TODO: replace 'this' with proper interface
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
  findSuitableNodeInRichNode(node: RichNode, position: number): RichNode | null {
    if (!node) {
      console.warn('no node provided to findSuitableNodeinRichNode'); // eslint-disable-line no-console
      return null;
    }
    const appropriateTextNodeFilter = (node: RichNode) =>
      node.start <= position && node.end >= position
      && node.type === 'text'
      && !isList(node.parent.domNode as HTMLElement);
    let textNodeContainingPosition = flatMap(node, appropriateTextNodeFilter, true);
    if (textNodeContainingPosition.length == 1) {
      // we've found a text node! huzah!
      return textNodeContainingPosition[0];
    }
    else {
      const textContainingPosition = flatMap(node, appropriateTextNodeFilter);
      if (textContainingPosition.length > 0) {
        // we have to guess which (empty) text node matches, taking the last matching one is a strategy that sort of works
        // this gives us the deepest/last node matching. it's horrid in the case of consecutive br's for example
        const newTextNode = nextTextNode(textContainingPosition[textContainingPosition.length - 1], this.rootNode);
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
   * set the carret position in the editor
   *
   * @method setCurrentPosition
   * @param {number} position of the range
   * @public
   */
  setCurrentPosition(position: number, optionalParent: HTMLElement | null = null) {
    let richNode = this.richNode;
    if (optionalParent) {
      const parentRichNode = getRichNodeMatchingDomNode(optionalParent, richNode);
      if (parentRichNode) {
        richNode = parentRichNode;
      }
    }
    else if (this.currentNode) {
      const currentRichNode = getRichNodeMatchingDomNode(this.currentNode, richNode);
      if (currentRichNode && position >= currentRichNode.start && position <= currentRichNode.end)
        richNode = currentRichNode;
    }
    if (richNode.end < position || richNode.start > position) {
      warn(`received invalid position, resetting to ${richNode.end}. end of provided richnode`, { id: 'contenteditable-editor.invalid-position' });
      position = richNode.end
    }
    let node = this.findSuitableNodeInRichNode(richNode, position);
    if (node) {
      this.setCaret(node.domNode, position - node.start);
    }
    else {
      console.warn('did not receive a suitable node to set cursor, can\'t set cursor!'); // eslint-disable-line no-console
    }
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
  clearHighlightForLocations(locations: Array<[number, number]>) {
    const currentNode = this.getRichNodeFor(this.currentNode);
    for (let location of locations) {
      cancelProperty(this.selectHighlight(location), this, highlightProperty); // todo: replace 'this' with proper interface
    }
  }

  /**
   * Pernet API
   * TODO: remove these methods once plugins switched to the new plugin editor api
   */
  selectCurrentSelection(): PernetSelection {
    return selectCurrentSelection.bind(this)(...arguments);
  }
  selectHighlight([start, end]: [number, number]): PernetSelection {
    return selectHighlight.bind(this)([start, end]);
  }
  selectContext(): PernetSelection {
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

  /* Potential methods for the new API */
  getContexts(options: {region?: [number,number]}) {
    const { region } = options || {};
    if (region)
      return scanContexts(this.rootNode, region);
    else
      return scanContexts(this.rootNode);
  }

  isEmpty() {
    return isEmpty.bind(this)(...arguments);
  }
  findRichNode() {
    return findRichNode.bind(this)(...arguments);
  }
  findUniqueRichNodes() {
    return findUniqueRichNodes.bind(this)(...arguments);
  }

  /**
 * execute a DOM transformation on the editor content, ensures a consistent editor state
 * @method externalDomUpdate
 * @param {String} description
 * @param {function} domUpdate
 * @param {boolean} maintainCursor, keep cursor in place if possible
 * @public
 */
  externalDomUpdate(description: string, domUpdate: () => void, maintainCursor: boolean = false) {
    debug(`executing an external dom update: ${description}`);
    const selection = window.getSelection();
    if (selection && selection.isCollapsed) {
      const offset = selection.anchorOffset;
      const anchor = selection.anchorNode;
      domUpdate();
      this.updateRichNode();
      if (maintainCursor && anchor && this.rootNode.contains(anchor)) {
        this.setCaret(anchor, offset);
      }
      else {
        this.updateSelectionAfterComplexInput();
      }
      taskFor(this.generateDiffEvents).perform();
    }
    else {
      domUpdate();
      this.updateRichNode();
      this.updateSelectionAfterComplexInput();
      taskFor(this.generateDiffEvents).perform();
    }
  }
}
