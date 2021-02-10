import ModelSelectionTracker from "@lblod/ember-rdfa-editor/utils/ce/model-selection-tracker";
import HtmlReader from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import HtmlWriter from "@lblod/ember-rdfa-editor/model/writers/html-writer";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {getWindowSelection, isElement} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import SelectionReader from "@lblod/ember-rdfa-editor/model/readers/selection-reader";
import SelectionWriter from "@lblod/ember-rdfa-editor/model/writers/selection-writer";


/**
 * Abstraction layer for the DOM. This is the only class that is allowed to call DOM methods.
 * Code that needs to modify the DOM has to use a {@link Command}.
 * The model is still exposed for querying but that might become even more restricted later.
 */
export default class Model {

  private modelSelectionTracker: ModelSelectionTracker;
  /**
   * The root of the editor. This will get set by ember,
   * so we trick typescript into assuming it is never null
   * @private
   */
  private _rootNode!: HTMLElement;
  private _rootModelNode!: ModelElement;
  private reader: HtmlReader;
  private writer: HtmlWriter;
  private nodeMap: WeakMap<Node, ModelNode>;
  private selectionReader: SelectionReader;
  private selectionWriter: SelectionWriter;
  private _selection: ModelSelection;

  constructor() {
    this.modelSelectionTracker = new ModelSelectionTracker(this);
    this.reader = new HtmlReader(this);
    this.writer = new HtmlWriter(this);
    this.nodeMap = new WeakMap<Node, ModelNode>();
    this.selectionReader = new SelectionReader(this);
    this.selectionWriter = new SelectionWriter();
    this._selection = new ModelSelection(this);
  }

  get rootNode(): HTMLElement {
    return this._rootNode;
  }

  set rootNode(rootNode: HTMLElement) {
    this.modelSelectionTracker.stopTracking();
    this._rootNode = rootNode;
    if(this._rootNode) {
      this.modelSelectionTracker.startTracking();
    }
  }

  get selection(): ModelSelection {
    return this._selection;
  }

  get rootModelNode(): ModelElement {
    return this._rootModelNode;
  }


  /**
   * Read in the document and build up the model
   */
  read() {
    const newRoot = this.reader.read(this.rootNode);
    if (!newRoot) {
      throw new Error("Could not create a rich root");
    }
    if(!ModelNode.isModelElement(newRoot)) {
      throw new Error("root model node has to be an element");
    }
    this._rootModelNode = newRoot;
    this.bindNode(this.rootModelNode, this.rootNode);
    // This is essential, we change the root so we need to make sure the selection uses the new root
    this.readSelection();
  }

  readSelection() {
    this._selection = this.selectionReader.read(getWindowSelection());
  }

  /**
   * Write a part of the model back to the dom
   * @param tree
   */
  write(tree: ModelElement = this.rootModelNode) {
    const modelWriteEvent = new CustomEvent(
      'editorModelWrite',
    );
    document.dispatchEvent(modelWriteEvent);
    const oldRoot = tree.boundNode;
    if (!oldRoot) {
      throw new Error("Container without boundNOde");
    }
    if (!isElement(oldRoot)) {
      throw new NotImplementedError("root is not an element, not sure what to do");
    }
    const newRoot = this.writer.write(tree);
    while (oldRoot.firstChild) {
      oldRoot.removeChild(oldRoot.firstChild);
    }
    oldRoot.append(...newRoot.childNodes);
    this.bindNode(tree, oldRoot);
    this.writeSelection();
  }

  writeSelection() {
    this.selectionWriter.write(this.selection);
  }

  generateUuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Bind a modelNode to a domNode. This ensures that we can reach the corresponding node from
   * either side
   * @param modelNode
   * @param domNode
   */
  bindNode(modelNode: ModelNode, domNode: Node) {
    this.nodeMap.delete(domNode);
    modelNode.boundNode = domNode;
    this.nodeMap.set(domNode, modelNode);
  }

  /**
   * Get the corresponding modelNode for domNode
   * @param domNode
   */
  getModelNodeFor(domNode: Node) {
    if(!this.nodeMap ) return;
    return this.nodeMap.get(domNode);
  }

  /**
   * Remove a node from the model
   * TODO: untested
   * @param modelNode
   */
  removeModelNode(modelNode: ModelNode) {
    if (modelNode.boundNode) {
      this.nodeMap.delete(modelNode.boundNode);
    }
    if (modelNode.parent) {
      this.removeChildFromParent(modelNode, modelNode.parent);
    }
  }


  static getChildIndex(child: Node): number | null {
    const parent = child.parentNode;
    if (!parent) {
      return null;
    }
    let index = 0;
    // more verbose but probably more efficient than converting to an array and using indexOf
    for (const candidate of parent.childNodes) {
      if (child === candidate) {
        return index;
      }
      index ++;
    }
    return null;
  }

  private removeChildFromParent(child: ModelNode, parent: ModelElement) {
    const index = parent.children.indexOf(child);
    parent.children.splice(index, 1);
    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling;
    }
    if (child.nextSibling) {
      child.nextSibling = child.previousSibling;
    }
  }
}
