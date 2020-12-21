import RichSelectionTracker, {RichSelection} from "@lblod/ember-rdfa-editor/utils/ce/rich-selection-tracker";
import IterableNodeIterator from "@lblod/ember-rdfa-editor/model/iterable-node-iterator";
import RichElement from "@lblod/ember-rdfa-editor/model/rich-element";
import SimpleReader from "@lblod/ember-rdfa-editor/model/simple-reader";
import Reader from "@lblod/ember-rdfa-editor/model/reader";
import SimpleWriter from "@lblod/ember-rdfa-editor/model/simple-writer";
import Writer from "@lblod/ember-rdfa-editor/model/writer";

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
  private rootRichElement!: RichElement;
  private reader: Reader;
  private writer: Writer;

  constructor() {
    this.richSelectionTracker = new RichSelectionTracker(this);
    this.richSelectionTracker.startTracking();
    this.reader = new SimpleReader();
    this.writer = new SimpleWriter();
  }
  get rootNode() : HTMLElement {
    return this._rootNode;
  }

  set rootNode(rootNode: HTMLElement) {
    this._rootNode = rootNode;
  }

  get selection() : RichSelection {
    return this.richSelectionTracker.richSelection;
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
    const newRoot = this.readRec(this.rootNode);
    if(!newRoot) {
      throw new Error("Could not create a rich root");
    }
    this.rootRichElement = newRoot;
  }

  private readRec(node: Node): RichElement | null {
    const richEl = this.reader.read(node);
    for(const child of node.childNodes) {
      const richChild = this.readRec(child);
      if(richChild && richEl) {
        richEl.children.push(richChild);
      }
    }
    return richEl;
  }
  write() {
    const newRoot = this.writeRec(this.rootRichElement);
    for(const attribute of this.rootNode.attributes) {
      newRoot.setAttribute(attribute.name, attribute.value);
    }
    while(this.rootNode.firstChild) {
      this.rootNode.firstChild.remove();
    }
    this.rootNode.append(...newRoot.childNodes);
  }
  writeRec(element: RichElement): HTMLElement {
    const domEl = this.writer.write(element);
    for(const child of element.children) {
      const domChild = this.writeRec(child);
      domEl.appendChild(domChild);
    }
    return domEl;

  }
}
