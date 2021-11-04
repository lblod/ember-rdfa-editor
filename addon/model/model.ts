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
import ModelHistory from "@lblod/ember-rdfa-editor/model/model-history";
import {Diary} from "diary";
import {createLogger} from "@lblod/ember-rdfa-editor/utils/logging-utils";
import SimplifiedModel from "@lblod/ember-rdfa-editor/model/simplified-model";

/**
 * Abstraction layer for the DOM. This is the only class that is allowed to call DOM methods.
 * Code that needs to modify the DOM has to use a {@link Command}.
 * The model is still exposed for querying but that might become even more restricted later.
 */
export default class Model {
  /**
   * The root of the editor. This will get set by ember,
   * so we trick typescript into assuming it is never null.
   * @protected
   */
  protected _rootModelNode!: ModelElement;
  private _selection: ModelSelection;
  private _rootNode: HTMLElement;

  private reader: HtmlReader;
  private writer: HtmlWriter;
  private nodeMap: WeakMap<Node, ModelNode>;
  private selectionReader: SelectionReader;
  private selectionWriter: SelectionWriter;
  private history: ModelHistory = new ModelHistory();

  private logger: Diary;

  constructor(rootNode: HTMLElement) {
    this._rootNode = rootNode;
    this.reader = new HtmlReader(this);
    this.writer = new HtmlWriter(this);
    this.nodeMap = new WeakMap<Node, ModelNode>();
    this.selectionReader = new SelectionReader(this);
    this.selectionWriter = new SelectionWriter();
    this._selection = new ModelSelection();
    this.logger = createLogger("RawEditor");
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
   * Read in the document and build up the model.
   */
  read(readSelection = true) {
    const parsedNodes = this.reader.read(this.rootNode);
    if (parsedNodes.length !== 1) {
      throw new Error("Could not create a rich root");
    }

    const newRoot = parsedNodes[0];
    if (!ModelNode.isModelElement(newRoot)) {
      throw new Error("Root model node has to be an element");
    }

    this._rootModelNode = newRoot;
    this.bindNode(this.rootModelNode, this.rootNode);

    // This is essential, we change the root so we need to make sure the selection uses the new root.
    if (readSelection) {
      this.readSelection();
    }
  }

  readSelection(domSelection: Selection = getWindowSelection()) {
    this._selection = this.selectionReader.read(domSelection);
  }

  /**
   * Write a part of the model back to the dom.
   * @param tree
   * @param writeSelection If we should also write out the selection. Should be
   * almost always true, but can be useful for testing to turn it off when you dont
   * have a real dom available.
   */
  write(tree: ModelElement = this.rootModelNode, writeSelection = true) {
    const modelWriteEvent = new CustomEvent("editorModelWrite");
    document.dispatchEvent(modelWriteEvent);

    const oldRoot = tree.boundNode;
    if (!oldRoot) {
      throw new Error("Container without boundNode");
    }

    if (!isElement(oldRoot)) {
      throw new NotImplementedError("Root is not an element, not sure what to do");
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
   * either side.
   * @param modelNode
   * @param domNode
   */
  bindNode(modelNode: ModelNode, domNode: Node) {
    this.nodeMap.delete(domNode);
    modelNode.boundNode = domNode;
    this.nodeMap.set(domNode, modelNode);
  }

  /**
   * Get the corresponding modelNode for domNode.
   * @param domNode
   */
  public getModelNodeFor(domNode: Node): ModelNode {
    if (!this.nodeMap) {
      throw new ModelError("Uninitialized nodeMap");
    }

    const result = this.nodeMap.get(domNode);
    if (!result) {
      throw new ModelError("No bound node for domNode");
    }

    return result;
  }

  /**
   * Change the model by providing a callback that will receive an {@link ImmediateModelMutator immediate mutator}.
   * The model gets written out automatically after the callback finishes.
   *
   * @param callback
   * @param writeBack
   */
  change(callback: (mutator: ImmediateModelMutator) => ModelElement | void, writeBack = true) {
    const mutator = new ImmediateModelMutator();
    const subTree = callback(mutator);

    if (writeBack) {
      if (subTree) {
        this.write(subTree);
      } else {
        this.write(this.rootModelNode);
      }
    }
  }

  /**
   * Change the model by providing a callback that will receive a {@link BatchedModelMutator batched mutator}
   * The mutator gets flushed and the model gets written out automatically after the callback finishes.
   *
   * @param callback
   * @param autoSelect
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

    // More verbose but probably more efficient than converting to an array and using indexOf.
    let index = 0;
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

  createSnapshot(): SimplifiedModel {
    const rootModelNode = this.rootModelNode.clone();
    const modelSelection = this.selection.clone(rootModelNode);

    return new SimplifiedModel(rootModelNode, modelSelection);
  }

  saveSnapshot(): void {
    const snapshot = this.createSnapshot();
    this.history.push(snapshot);
  }

  restoreSnapshot(snapshot: SimplifiedModel | undefined = this.history.pop(), writeBack = true) {
    if (snapshot) {
      this._rootModelNode = snapshot.rootModelNode;
      this._selection = snapshot.modelSelection;

      if (writeBack) {
        this.write();
      }
    } else {
      this.logger.warn("No snapshot to restore");
    }
  }
}
