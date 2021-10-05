import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import {ModelMutator} from "@lblod/ember-rdfa-editor/core/mutators/model-mutator";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ImmediateModelMutator from "@lblod/ember-rdfa-editor/core/mutators/immediate-model-mutator";
import {getWindowSelection, isElement} from "@lblod/ember-rdfa-editor/archive/utils/dom-helpers";
import {ModelError, NotImplementedError} from "@lblod/ember-rdfa-editor/archive/utils/errors";
import HtmlWriter from "@lblod/ember-rdfa-editor/core/writers/html-writer";
import SelectionWriter from "@lblod/ember-rdfa-editor/core/writers/selection-writer";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import HtmlReader from "@lblod/ember-rdfa-editor/core/readers/html-reader";
import SelectionReader from "@lblod/ember-rdfa-editor/core/readers/selection-reader";

export default interface EditorModel {
  get rootElement(): HTMLElement;

  get selection(): ModelSelection;

  change(source: string, callback: (mutator: ModelMutator) => ModelElement | void): void;

  getModelNodeFor(resultingNode: Node): ModelNode;

  /**
   * Bind a modelNode to a domNode. This ensures that we can reach the corresponding node from
   * either side.
   * @param modelNode
   * @param domNode
   */
  bindNode(modelNode: ModelNode, domNode: Node): void;
}

export class HtmlModel implements EditorModel {
  private _selection: ModelSelection;
  private writer: HtmlWriter;
  private selectionWriter: SelectionWriter;
  private _rootModelNode?: ModelElement;
  private _rootElement: HTMLElement;
  private nodeMap: WeakMap<Node, ModelNode>;
  private reader: HtmlReader;
  private selectionReader: SelectionReader;

  constructor(rootElement: HTMLElement) {
    this._selection = new ModelSelection();
    this.writer = new HtmlWriter(this);
    this.selectionWriter = new SelectionWriter();
    this.nodeMap = new WeakMap<Node, ModelNode>();
    this.reader = new HtmlReader(this);
    this.selectionReader = new SelectionReader(this);
    this._rootElement = rootElement;
    this.read();
  }

  get rootModelNode(): ModelElement {
    if (!this._rootModelNode) {
      throw new ModelError('Model without rootnode');
    }
    return this._rootModelNode;
  }

  get rootElement(): HTMLElement {
    return this._rootElement;
  }

  set rootElement(node: HTMLElement) {
    this._rootElement = node;
    this.read();
  }

  change(source: string, callback: (mutator: ModelMutator) => (ModelElement | void), writeBack = true): void {
    const mutator = new ImmediateModelMutator();
    const subTree = callback(mutator);

    if (writeBack) {
      if (subTree) {
        this.write(source, subTree);
      } else {
        this.write(source, this.rootModelNode);
      }
    }
  }

  /**
   * Read in the document and build up the model.
   */
  private read(readSelection = true) {
    const parsedNodes = this.reader.read(this.rootElement);
    if (parsedNodes.length !== 1) {
      throw new Error("Could not create a rich root");
    }

    const newRoot = parsedNodes[0];
    if (!ModelNode.isModelElement(newRoot)) {
      throw new Error("Root model node has to be an element");
    }

    this._rootModelNode = newRoot;
    this.bindNode(this.rootModelNode, this.rootElement);

    // This is essential, we change the root so we need to make sure the selection uses the new root.
    if (readSelection) {
      this.readSelection();
    }
  }

  readSelection(domSelection: Selection = getWindowSelection()) {
    this._selection = this.selectionReader.read(domSelection);
  }

  private write(source: string, tree: ModelElement, writeSelection = true) {
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

    // EventBus.emitDebounced(100, new ModelWrittenEvent(executedBy));
    if (writeSelection) {
      this.writeSelection();
    }

  }

  private writeSelection() {
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

    const result = this.nodeMap.get(domNode);
    if (!result) {
      throw new ModelError("No bound node for domNode");
    }

    return result;
  }

  get selection(): ModelSelection {
    return this._selection;
  }

}
