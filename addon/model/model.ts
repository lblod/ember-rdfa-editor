import HtmlReader from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import HtmlWriter from "@lblod/ember-rdfa-editor/model/writers/html-writer";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {getWindowSelection, isElement} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {ModelError, NotImplementedError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import SelectionReader from "@lblod/ember-rdfa-editor/model/readers/selection-reader";
import SelectionWriter from "@lblod/ember-rdfa-editor/model/writers/selection-writer";
import BatchedModelMutator from "@lblod/ember-rdfa-editor/model/mutators/batched-model-mutator";
import ImmediateModelMutator from "@lblod/ember-rdfa-editor/model/mutators/immediate-model-mutator";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";


/**
 * Abstraction layer for the DOM. This is the only class that is allowed to call DOM methods.
 * Code that needs to modify the DOM has to use a {@link Command}.
 * The model is still exposed for querying but that might become even more restricted later.
 */
export default class Model {

  /**
   * The root of the editor. This will get set by ember,
   * so we trick typescript into assuming it is never null
   * @private
   */
  protected _rootModelNode!: ModelElement;
  private reader: HtmlReader;
  private writer: HtmlWriter;
  private nodeMap: WeakMap<Node, ModelNode>;
  private selectionReader: SelectionReader;
  private selectionWriter: SelectionWriter;
  private _selection: ModelSelection;
  private _rootNode: HTMLElement;

  constructor(rootNode: HTMLElement) {
    this._rootNode = rootNode;
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


  get selection(): ModelSelection {
    return this._selection;
  }

  get rootModelNode(): ModelElement {
    return this._rootModelNode;
  }


  /**
   * Read in the document and build up the model
   */
  read(readSelection = true) {
    const parsedNodes = this.reader.read(this.rootNode);
    if (parsedNodes.length !== 1) {
      throw new Error("Could not create a rich root");
    }
    const newRoot = parsedNodes[0];
    if (!ModelNode.isModelElement(newRoot)) {
      throw new Error("root model node has to be an element");
    }
    this._rootModelNode = newRoot;
    this.bindNode(this.rootModelNode, this.rootNode);
    // This is essential, we change the root so we need to make sure the selection uses the new root
    if (readSelection) {
      this.readSelection();
    }
  }

  readSelection(domSelection: Selection = getWindowSelection()) {
    this._selection = this.selectionReader.read(domSelection);
  }

  /**]
   * Write a part of the model back to the dom
   * @param tree
   * @param writeSelection if we should also write out the selection. Should be
   * almost always true, but can be useful for testing to turn it off when you dont
   * have a real dom available
   */
  write(tree: ModelElement = this.rootModelNode, writeSelection = true) {
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
    if (writeSelection) {
      this.writeSelection();
    }
  }

  writeSelection() {
    this.selectionWriter.write(this.selection);
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
  public getModelNodeFor(domNode: Node): ModelNode {
    if (!this.nodeMap) throw new ModelError("uninitialized nodeMap");
    const rslt = this.nodeMap.get(domNode);
    if (!rslt) {
      throw new ModelError("No boundnode for domNode");
    }
    return rslt;
  }

  /**
   * Change the model by providing a callback with will receive an {@link ImmediateModelMutator immediate mutator}
   * The model gets written out automatically after the callback finishes.
   * @param callback
   */
  change(callback: (mutator: ImmediateModelMutator) => ModelElement | void) {
    const mutator = new ImmediateModelMutator();
    const subTree = callback(mutator);
    if (subTree) {
      this.write(subTree);
    } else {
      this.write(this.rootModelNode);
    }
  }


  /**
   * Change the model by providing a callback with will receive a {@link BatchedModelMutator batched mutator}
   * The mutator gets flushed and the model gets written out automatically after the callback finishes.
   * @param callback
   */
  batchChange(callback: (mutator: BatchedModelMutator) => ModelElement | void, autoSelect = true) {
    const mutator = new BatchedModelMutator();
    const subTree = callback(mutator);
    const resultingRange = mutator.flush();
    if (autoSelect && resultingRange) {
      this.selection.selectRange(resultingRange);
    }
    if (subTree) {
      this.write(subTree);
    } else {
      this.write();
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
      index++;
    }
    return null;
  }

  selectRange(range: ModelRange) {
    this.selection.selectRange(range);
  }

  toXml(): Node {
    return this.rootModelNode.toXml();
  }

}
