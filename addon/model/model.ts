import RichSelectionTracker, {RichSelection} from "@lblod/ember-rdfa-editor/utils/ce/rich-selection-tracker";
import IterableNodeIterator from "@lblod/ember-rdfa-editor/model/iterable-node-iterator";
import {isElement, removeNode} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {DomElementError} from "@lblod/ember-rdfa-editor/utils/errors";
import HtmlReader from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import RichElementContainer from "@lblod/ember-rdfa-editor/model/rich-element-container";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";
import HtmlWriter from "@lblod/ember-rdfa-editor/model/writers/html-writer";
import RichText from "@lblod/ember-rdfa-editor/model/rich-text";

export type RichContainer = RichElementContainer | RichTextContainer;

/**
 * Abstraction layer for the DOM. This is the only class that is allowed to call DOM methods.
 * Code that needs to modify the DOM has to use a {@link Command}.
 * The model is still exposed for querying but that might become even more restricted later.
 */
export default class Model {

  private richSelectionTracker: RichSelectionTracker;
  /**
   * The root of the editor. This will get set by ember,
   * so we trick typescript into assuming it is never null
   * @private
   */
  private _rootNode!: HTMLElement;
  private _rootRichElement!: RichContainer;
  private reader: HtmlReader;
  private writer: HtmlWriter;
  private elementMap: Map<string, RichContainer>;
  private idCounter: number = 0;

  constructor() {
    this.richSelectionTracker = new RichSelectionTracker(this);
    this.richSelectionTracker.startTracking();
    this.reader = new HtmlReader(this);
    this.writer = new HtmlWriter(this);
    this.elementMap = new Map<string, RichElementContainer | RichTextContainer>();
  }

  get rootNode(): HTMLElement {
    return this._rootNode;
  }

  set rootNode(rootNode: HTMLElement) {
    this._rootNode = rootNode;
  }

  get selection(): RichSelection {
    return this.richSelectionTracker.richSelection;
  }

  get rootRichElement(): RichContainer {
    return this._rootRichElement;
  }

  createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions) {
    return document.createElement<K>(tagName, options);
  }

  /**
   * Creates an iterator that will visit every node in the
   * tree of root in document order.
   * @param root the root of the tree
   * @param whatToShow A combination of constants from the NodeFilter class, defaults to SHOW_ALL
   * @param filter a custom filter
   */
  createNodeIterator<T extends Node = Node>(root: Node, whatToShow?: number, filter?: NodeFilter | null): IterableNodeIterator<T> {
    const ni = document.createNodeIterator(root, whatToShow, filter);
    return new IterableNodeIterator(ni);
  }

  surroundSelectionContents(node: Node) {
    this.selection.domSelection.getRangeAt(0).surroundContents(node);
  }

  read() {
    const newRoot = this.reader.read(this.rootNode);
    if (!newRoot) {
      throw new Error("Could not create a rich root");
    }
    this._rootRichElement = newRoot;
  }

  write(tree: RichContainer = this.rootRichElement) {
    const oldRoot = tree.boundNode!;
    const newRoot = this.writer.write(tree);
    while(oldRoot.firstChild) {
      oldRoot.removeChild(oldRoot.firstChild);
    }
    this.bindRichElement(tree, oldRoot);
    oldRoot.append(...newRoot.childNodes);
    this.selection.modelSelection.writeToDom();
  }

  bindRichElement(richElement: RichContainer, domElement: HTMLElement): void {
    let id;
    if(domElement.dataset.editorId) {
      id = domElement.dataset.editorId;
    } else {
      id = this.getNewEditorId();
    }
    richElement.boundNode = domElement;
    domElement.dataset.editorId = id;
    this.elementMap.set(id, richElement);
  }

  getNewEditorId(): string {
    this.idCounter++;
    return this.idCounter.toString();
  }

  getRichElementFor(element: HTMLElement): RichContainer {
    let current = element;
    while (!current.dataset.editorId && current.parentElement) {
      current = current.parentElement;
    }
    const id = current.dataset.editorId;
    if (id) {
      return this.elementMap.get(id)!;
    }
    return this.rootRichElement;
  }

  ensureHTMLElement(node: Node): HTMLElement {
    if (isElement(node)) {
      return node as HTMLElement;
    } else if (node.parentElement) {
      return node.parentElement as HTMLElement;
    } else {
      throw new DomElementError("non-element node without parent");
    }
  }
}
