import ModelSelectionTracker from "@lblod/ember-rdfa-editor/utils/ce/model-selection-tracker";
import HtmlReader from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import RichElementContainer from "@lblod/ember-rdfa-editor/model/rich-element-container";
import {RichTextContainer} from "@lblod/ember-rdfa-editor/model/rich-text-container";
import HtmlWriter from "@lblod/ember-rdfa-editor/model/writers/html-writer";
import RichText from "@lblod/ember-rdfa-editor/model/rich-text";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {isElement} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

export type RichContainer = RichElementContainer | RichTextContainer;

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
  private idCounter: number = 0;
  private nodeMap: Map<Node, ModelNode>;

  constructor() {
    this.modelSelectionTracker = new ModelSelectionTracker(this);
    this.modelSelectionTracker.startTracking();
    this.reader = new HtmlReader(this);
    this.writer = new HtmlWriter(this);
    this.nodeMap = new Map<Node, ModelNode>();
  }

  get rootNode(): HTMLElement {
    return this._rootNode;
  }

  set rootNode(rootNode: HTMLElement) {
    this._rootNode = rootNode;
  }

  get selection(): ModelSelection {
    return this.modelSelectionTracker.modelSelection;
  }

  get rootModelNode(): ModelNode {
    return this._rootModelNode;
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
    this._rootModelNode = newRoot;
  }

  /**
   * Write a part of the model back to the dom
   * @param tree
   */
  write(tree: ModelNode = this.rootModelNode) {
    const oldRoot = tree.boundNode;
    if (!oldRoot) {
      throw new Error("Conatiner without boundNOde");
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

  bindNode(modelNode: ModelNode, domNode: Node) {
    modelNode.boundNode = domNode;
    this.nodeMap.set(domNode, modelNode);
  }

  getModelNodeFor(domNode: Node) {
    if(!this.nodeMap) return;
    return this.nodeMap.get(domNode);
  }

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
