import Model from "@lblod/ember-rdfa-editor/model/model";
import {getWindowSelection, isElement, isTextNode} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {PropertyState} from "@lblod/ember-rdfa-editor/utils/ce/model-selection-tracker";
import {analyse} from '@lblod/marawa/rdfa-context-scanner';
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";

/**
 * Just like the {@link Model} is a representation of the document, the ModelSelection is a representation
 * of the document selection.
 */
export default class ModelSelection {

  anchor: ModelText | null = null;
  focus: ModelText | null = null;
  anchorOffset: number = 0;
  focusOffset: number = 0;
  commonAncestor: ModelNode | null = null;
  domSelection: Selection | null = null;
  private model: Model;


  constructor(model: Model, selection: Selection) {
    this.model = model;
    this.setFromDomSelection(selection);
  }

  /**
   * @return whether the selection is collapsed
   */
  get isCollapsed() {
    return this.anchor === this.focus && this.anchorOffset === this.focusOffset;
  }


  get bold(): PropertyState {
    return this.getTextPropertyStatus("bold");
  }

  get italic(): PropertyState {
    return this.getTextPropertyStatus("italic");
  }

  get underline(): PropertyState {
    return this.getTextPropertyStatus("underline");
  }

  get strikethrough(): PropertyState {
    return this.getTextPropertyStatus("strikethrough");
  }

  get rdfaSelection() {
    if (!this.domSelection) return;
    return this.caculateRdfaSelection(this.domSelection);
  }

  get subtree() {
    if (!this.domSelection) return;
    let subtree = this.domSelection.getRangeAt(0).commonAncestorContainer;
    if (!isElement(subtree)) {
      subtree = subtree.parentElement!;
    }
    return subtree;
  }

  getTextPropertyStatus(property: TextAttribute): PropertyState {
    if (this.isCollapsed) {
      return this.anchor?.getTextAttribute(property) ? PropertyState.enabled : PropertyState.disabled;
    } else {
      const nodeFinder = new ModelNodeFinder<ModelText>({
          startNode: this.anchor!,
          endNode: this.focus!,
          rootNode: this.model.rootModelNode,
          nodeFilter: ModelNode.isModelText,
        }
      );
      const first = nodeFinder.next()?.getTextAttribute(property);
      for (const node of nodeFinder) {
        if (node.getTextAttribute(property) !== first) {
          return PropertyState.unknown;
        }
      }
      return first ? PropertyState.enabled : PropertyState.disabled;
    }

  }

  /**
   * Collapse the selection into a caret
   * @param toLeft whether the caret should end up at the beginning of the selection, defaults to false
   */
  collapse(toLeft: boolean = false) {
    if (toLeft) {
      this.anchor = this.focus;
      this.anchorOffset = this.focusOffset;
    } else {
      this.focus = this.anchor;
      this.focusOffset = this.anchorOffset;
    }
  }

  setAnchor(node: ModelText, offset: number = 0) {
    this.anchor = node;
    this.anchorOffset = offset;
  }

  setFocus(node: ModelText, offset: number = 0) {
    this.focus = node;
    this.focusOffset = offset;
  }

  /**
   * Select a full ModelText node
   * @param node
   */
  selectNode(node: ModelText) {
    this.anchor = node;
    this.anchorOffset = 0;
    this.focus = node;
    this.focusOffset = node.length;
  }

  /**
   * Build the modelSelection from the domSelection
   * TODO: needs cleanup. Crucial method, has to be perfect and preferably well-tested
   * @param selection
   */
  setFromDomSelection(selection: Selection) {
    if (!selection.anchorNode || !selection.focusNode) {
      return;
    }
    this.domSelection = selection;
    if (!isTextNode(selection.anchorNode) || !isTextNode(selection.focusNode)) {
      throw new SelectionError("Selected nodes are not text nodes");
    }

    // this cast is safe given a normalized (anchor and offset always in textnodes) selection
    const domAnchor = selection.anchorNode as Text;
    const domFocus = selection.focusNode as Text;

    const modelAnchor = this.model.getModelNodeFor(domAnchor) as ModelText | undefined;
    const modelFocus = this.model.getModelNodeFor(domFocus) as ModelText | undefined;

    if (!modelAnchor || !modelFocus) {
      return;
    }

    this.anchor = modelAnchor;
    this.focus = modelFocus;
    this.anchorOffset = selection.anchorOffset;
    this.focusOffset = selection.focusOffset;

    const commonAncestor = selection.getRangeAt(0)?.commonAncestorContainer;
    if (!selection.isCollapsed && commonAncestor) {
      if (isElement(commonAncestor)) {
        this.commonAncestor = this.model.getModelNodeFor(commonAncestor) as ModelElement;

      } else {
        this.commonAncestor = this.model.getModelNodeFor(commonAncestor as Text)!.parent!;
      }
    } else {
      this.commonAncestor = this.focus.parent || this.focus;
    }
    if (this.isSelectionBackwards(selection)) {
      const tempEl = this.anchor;
      const tempOff = this.anchorOffset;

      this.anchor = this.focus;
      this.focus = tempEl;
      this.anchorOffset = this.focusOffset;
      this.focusOffset = tempOff;
    }
  }

  /**
   * Set the domSelection to match the modelSelection
   * TODO: needs cleanup. Crucial method, has to be perfect and preferably well-tested
   */
  writeToDom() {
    if (!this.anchor || !this.focus) {
      let cur: ModelNode = this.model.rootModelNode;
      while (cur && !ModelNode.isModelText(cur)) {
        if (!ModelNode.isModelElement(cur)) {
          throw new SelectionError("Unsupported node type");
        }
        cur = cur.firstChild;
      }
      this.anchor = cur;
      this.focus = cur;
    }
    try {
      const selection = getWindowSelection();
      selection.setBaseAndExtent(this.anchor.boundNode!, this.anchorOffset, this.focus.boundNode!, this.focusOffset);
    } catch (e) {
      console.log(e);
    }
  }


  /**
   * Helper trick to find out if the domSelection was selected right-to-left or not
   * Taken from the internet
   * @param selection
   * @private
   */
  private isSelectionBackwards(selection: Selection) {
    const range = document.createRange();
    range.setStart(selection.anchorNode!, selection.anchorOffset);
    range.setEnd(selection.focusNode!, selection.focusOffset);

    return range.collapsed;
  }


  caculateRdfaSelection(selection: Selection) {
    if (selection.type === 'Caret') {
      if (!selection.anchorNode) {
        throw new SelectionError("Selection has no anchorNode");
      }
      const rdfaSelection = analyse(selection.anchorNode);
      return rdfaSelection;
    } else {
      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;
      const rdfaSelection = analyse(commonAncestor);
      return rdfaSelection;
    }

  }

}
