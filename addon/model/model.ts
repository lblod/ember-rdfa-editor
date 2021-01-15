import ModelSelectionTracker from "@lblod/ember-rdfa-editor/utils/ce/model-selection-tracker";
import HtmlReader from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import HtmlWriter from "@lblod/ember-rdfa-editor/model/writers/html-writer";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {isElement} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";


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
  private _rootModelNode!: ModelNode;
  private reader: HtmlReader;
  private writer: HtmlWriter;
  private nodeMap: Map<String, ModelNode>;

  constructor() {
    this.modelSelectionTracker = new ModelSelectionTracker(this);
    this.reader = new HtmlReader(this);
    this.writer = new HtmlWriter(this);
    this.nodeMap = new Map<String, ModelNode>();
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
    return this.modelSelectionTracker.modelSelection;
  }

  get rootModelNode(): ModelNode {
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
    this._rootModelNode = newRoot;
    this.bindNode(this.rootModelNode, this.rootNode);
  }

  /**
   * Write a part of the model back to the dom
   * @param tree
   */
  write(tree: ModelNode = this.rootModelNode) {
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
    this.selection.writeToDom();
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
    let id;
    if(domNode.editorId) {
      id = domNode.editorId;
    } else {
      id = this.generateUuid();
      domNode.editorId = id;
    }
    modelNode.boundNode = domNode;
    this.nodeMap.set(id, modelNode);
  }

  /**
   * Get the corresponding modelNode for domNode
   * @param domNode
   */
  getModelNodeFor(domNode: Node) {
    if(!this.nodeMap ) return;
    return this.nodeMap.get(domNode.editorId);
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
