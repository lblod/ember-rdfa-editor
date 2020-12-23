import RichSelectionTracker, {RichSelection} from "@lblod/ember-rdfa-editor/utils/ce/rich-selection-tracker";
import HtmlReader from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import RichElementContainer from "@lblod/ember-rdfa-editor/model/rich-element-container";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";
import HtmlWriter from "@lblod/ember-rdfa-editor/model/writers/html-writer";

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

  /**
   * Read in the document and build up the model
   * @param node
   */
  read() {
    const newRoot = this.reader.read(this.rootNode);
    if (!newRoot) {
      throw new Error("Could not create a rich root");
    }
    this._rootRichElement = newRoot;
  }

  /**
   * Write a part of the model back to the dom
   * @param tree
   */
  write(tree: RichContainer = this.rootRichElement) {
    const oldRoot = tree.boundNode!;
    const newRoot = this.writer.write(tree);
    while (oldRoot.firstChild) {
      oldRoot.removeChild(oldRoot.firstChild);
    }
    this.bindRichElement(tree, oldRoot);
    oldRoot.append(...newRoot.childNodes);
    this.selection.modelSelection.writeToDom();
  }

  /**
   * Bind a RichElement to a domNode, setting an id on the domNode,
   * adding it to the elementMap, and setting the boundNode property on the RichElement
   * @param richElement
   * @param domElement
   */
  bindRichElement(richElement: RichContainer, domElement: HTMLElement): void {
    let id;
    if (domElement.dataset.editorId) {
      id = domElement.dataset.editorId;
    } else {
      id = this.getNewEditorId();
    }
    richElement.boundNode = domElement;
    domElement.dataset.editorId = id;
    this.elementMap.set(id, richElement);
  }

  /**
   * Return a new unused id
   */
  getNewEditorId(): string {
    this.idCounter++;
    return this.idCounter.toString();
  }

  /**
   * Find the RichElement belonging to a domnode
   * @param element
   */
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
}
