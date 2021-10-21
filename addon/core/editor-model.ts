import ModelSelection from "@lblod/ember-rdfa-editor/core/model/model-selection";
import {Mutator} from "@lblod/ember-rdfa-editor/core/mutator";
import ModelElement from "@lblod/ember-rdfa-editor/core/model/model-element";
import ImmediateModelMutator from "@lblod/ember-rdfa-editor/core/mutators/immediate-model-mutator";
import {getWindowSelection, isElement} from "@lblod/ember-rdfa-editor/util/dom-helpers";
import {ModelError, NotImplementedError} from "@lblod/ember-rdfa-editor/util/errors";
import HtmlWriter from "@lblod/ember-rdfa-editor/core/writers/html-writer";
import SelectionWriter from "@lblod/ember-rdfa-editor/core/writers/selection-writer";
import ModelNode from "@lblod/ember-rdfa-editor/core/model/model-node";
import HtmlReader from "@lblod/ember-rdfa-editor/core/readers/html-reader";
import SelectionReader from "@lblod/ember-rdfa-editor/core/readers/selection-reader";
import EventBus from "@lblod/ember-rdfa-editor/core/event-bus";
import ModelSelectionTracker from "@lblod/ember-rdfa-editor/core/model-selection-tracker";
import Inspector, {ModelInspector} from "@lblod/ember-rdfa-editor/core/inspector";
import SimplifiedModel from "@lblod/ember-rdfa-editor/core/simplified-model";
import ModelHistory from "@lblod/ember-rdfa-editor/core/model/model-history";
import {ModelReadEvent} from "@lblod/ember-rdfa-editor/core/editor-events";
import {getParentContext} from "@lblod/ember-rdfa-editor/util/rdfa-utils";
import {HtmlTreeNode} from "@lblod/ember-rdfa-editor/core/model/tree-node";
import Datastore from "@lblod/ember-rdfa-editor/util/datastore";


/**
 * Provides the interface necessary to query the VDOM state
 */
export interface ImmutableModel {
  get modelRoot(): ModelElement
  get viewRoot(): HTMLElement
  query<R>(source: string, callback: (inspector: Inspector) => R): R

  toXml(): Node;

  createSnapshot(): SimplifiedModel;
}

/**
 * Provides the interface necessary to perform mutations on the VDOM
 */
export interface MutableModel extends ImmutableModel {
  /**
   * Single entrypoint for VDOM mutations. Any kind of modifications made to the VDOM tree that do not
   * pass through this method are completely unsupported (and should eventually be impossible).
   *
   * @param source origin of the change, usually the name of an {@link EditorPlugin}
   * @param callback use this to actually make the changes
   * @param writeBack whether or not the modified vdom should be written to its final representation.
   * Should default to true in most cases.
   */
  change(source: string, callback: (mutator: Mutator, inspector: Inspector) => (ModelElement | void), writeBack?: boolean): void;

  get selection(): ModelSelection;

  restoreSnapshot(source: string, snapshot?: SimplifiedModel, writeBack?: boolean): void;

  saveSnapshot(): void;

}

/**
 * Contains and manages the actual VDOM state. The words Model and VDOM are often used interchangeably.
 * One instance of this will exist per {@link Editor} instance.
 * Currently this interface assumes the use of {@link Node DOMNodes} and {@link ModelNode ModelNodes}, but
 * the intent is that this will eventually be made more generic.
 */
export default interface EditorModel extends MutableModel {
  get rootElement(): HTMLElement;


  getModelNodeFor(resultingNode: Node): ModelNode;

  /**
   * Bind a modelNode to a domNode. This ensures that we can reach the corresponding node from
   * either side.
   * @param modelNode
   * @param domNode
   */
  bindNode(modelNode: ModelNode, domNode: Node): void;

  /**
   * Called right before the {@link RdfaEditor} component is destroyed.
   * Destroy any global state like dom event listeners here (arguably those shouldn't even be
   * here, but nobody's perfect).
   */
  onDestroy(): void;

  get parentContext(): Datastore;
}

/**
 * Default (and currently only) implementation of the {@link EditorModel} interface.
 * The HtmlModel writes out to an html document. This document is assumed to be live-rendered in a browser context,
 * so the javascript DOM api is expected to be available at all times.
 */
export class HtmlModel implements EditorModel {
  private _selection: ModelSelection;
  private writer: HtmlWriter;
  private selectionWriter: SelectionWriter;
  protected _rootModelNode?: ModelElement;
  private _rootElement: HTMLElement;
  private nodeMap: WeakMap<Node, ModelNode>;
  private reader: HtmlReader;
  private selectionReader: SelectionReader;
  private tracker: ModelSelectionTracker;
  private history: ModelHistory;
  private eventBus: EventBus;
  private _parentContext: Datastore;

  constructor(rootElement: HTMLElement, eventBus: EventBus) {
    this.writer = new HtmlWriter(this);
    this.selectionWriter = new SelectionWriter();
    this.nodeMap = new WeakMap<Node, ModelNode>();
    this.reader = new HtmlReader();
    this.selectionReader = new SelectionReader(this);
    this._rootElement = rootElement;
    this._parentContext = getParentContext(new HtmlTreeNode(this._rootElement));
    this.eventBus = eventBus;
    this._selection = new ModelSelection(this._parentContext);
    this.eventBus.on("selectionChanged", () => this.readSelection());
    this.tracker = new ModelSelectionTracker(this, this.eventBus);
    this.history = new ModelHistory();
    this.tracker.startTracking();
    this.read();
  }

  /**
   * @deprecated use modelRoot instead
   */
  get rootModelNode(): ModelElement {
    if (!this._rootModelNode) {
      throw new ModelError('Model without rootnode');
    }
    return this._rootModelNode;
  }

  get modelRoot(): ModelElement {
    return this.rootModelNode;
  }

  /**
   * @deprecated use viewRoot instead
   */
  get rootElement(): HTMLElement {
    return this._rootElement;
  }

  set rootElement(node: HTMLElement) {
    this._rootElement = node;
    this.read();
  }

  get viewRoot(): HTMLElement{
    return this.rootElement;
  }

  get parentContext(): Datastore {
    return this._parentContext;
  }

  change(source: string, callback: (mutator: Mutator, inspector: Inspector) => (ModelElement | void), writeBack = true): void {
    const mutator = new ImmediateModelMutator(this.eventBus);
    const inspector = new ModelInspector(this.eventBus);
    const subTree = callback(mutator, inspector);

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
  protected read(readSelection = true) {
    const {rootNodes: parsedNodes, nodeMap} = this.reader.read(this.rootElement);
    if (parsedNodes.length !== 1) {
      throw new Error("Could not create a rich root");
    }

    const newRoot = parsedNodes[0];
    if (!ModelNode.isModelElement(newRoot)) {
      throw new Error("Root model node has to be an element");
    }

    this._rootModelNode = newRoot;
    this.bindNode(this.rootModelNode, this.rootElement);
    this.mergeNodeMap(nodeMap);

    // This is essential, we change the root so we need to make sure the selection uses the new root.
    if (readSelection) {
      this.readSelection();
    }
    this.eventBus.emit(new ModelReadEvent());
  }

  private mergeNodeMap(otherMap: Map<Node, ModelNode>) {
    for (const [node, modelNode] of otherMap.entries()) {
      // TODO investigate if delete is necessary
      this.nodeMap.delete(node);
      this.nodeMap.set(node, modelNode);
    }
  }

  readSelection(domSelection: Selection = getWindowSelection()) {
    this._selection = this.selectionReader.read(domSelection);
  }

  protected write(_source: string, tree: ModelElement = this.rootModelNode, writeSelection = true) {
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

  protected writeSelection() {
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

  onDestroy() {
    this.tracker.stopTracking();
  }

  query<R>(_source: string, callback: (inspector: Inspector) => R): R {
    const inspector = new ModelInspector(this.eventBus);
    return callback(inspector);
  }

  toXml(): Node {
    return this.rootModelNode.toXml();
  }

  createSnapshot(): SimplifiedModel {
    const rootModelNode = this.rootModelNode.clone();
    const modelSelection = this.selection.clone(rootModelNode);

    return new SimplifiedModel(rootModelNode, modelSelection);
  }

  restoreSnapshot(executedBy: string, snapshot: SimplifiedModel | undefined = this.history.pop(), writeBack = true) {
    if (snapshot) {
      this._rootModelNode = snapshot.rootModelNode;
      this._selection = snapshot.modelSelection;

      if (writeBack) {
        this.write(executedBy);
      }
    } else {
      console.warn("No snapshot to restore");
    }
  }

  saveSnapshot(): void {
    const snapshot = this.createSnapshot();
    this.history.push(snapshot);
  }
}
