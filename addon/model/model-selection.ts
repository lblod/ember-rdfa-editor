import Model from "@lblod/ember-rdfa-editor/model/model";
import {getWindowSelection, isElement} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {NotImplementedError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {analyse} from '@lblod/marawa/rdfa-context-scanner';
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {PropertyState, RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";

/**
 * Just like the {@link Model} is a representation of the document, the ModelSelection is a representation
 * of the document selection.
 */
export default class ModelSelection {

  commonAncestor: ModelNode | null = null;
  domSelection: Selection | null = null;
  private _ranges: ModelRange[];
  private model: Model;
  private _isRightToLeft: boolean;


  constructor(model: Model) {
    this.model = model;
    this._ranges = [];
    this._isRightToLeft = false;
  }

  get focus(): ModelPosition | null {
    if (!this.lastRange) {
      return null;
    }
    if (this.isRightToLeft) {
      return this.lastRange.start;
    }
    return this.lastRange.end;
  }

  set focus(value: ModelPosition | null) {
    if (!value) {
      return;
    }
    this._isRightToLeft = false;
    if (!this.lastRange) {
      this.addRange(new ModelRange(value));
    } else if (!this.anchor) {
      this.lastRange.start = value;
      this.lastRange.end = value;
    } else if (this.anchor.compare(value) === RelativePosition.AFTER) {
      this._isRightToLeft = true;
      this.lastRange.start = value;
    } else {
      this.lastRange.end = value;
    }
  }

  get anchor(): ModelPosition | null {
    if (!this.lastRange) {
      return null;
    }
    if (this.isRightToLeft) {
      return this.lastRange.end;
    }
    return this.lastRange.start;
  }

  set anchor(value: ModelPosition | null) {
    if (!value) {
      return;
    }
    this._isRightToLeft = false;
    if (!this.lastRange) {
      this.addRange(new ModelRange(value));
    } else if (!this.focus) {
      this.lastRange.start = value;
      this.lastRange.end = value;
    } else if (this.focus.compare(value) === RelativePosition.BEFORE) {
      this._isRightToLeft = true;
      this.lastRange.end = value;
    } else {
      this.lastRange.start = value;
    }
  }

  get lastRange() {
    if (this._ranges.length) {
      return this._ranges[this._ranges.length - 1];
    } else {
      return null;
    }
  }

  get ranges(): ModelRange[] {
    return this._ranges;
  }

  set ranges(value: ModelRange[]) {
    this._isRightToLeft = false;
    this._ranges = value;
  }

  get isRightToLeft() {
    return this._isRightToLeft;
  }

  set isRightToLeft(value: boolean) {
    this._isRightToLeft = value;
  }

  addRange(range: ModelRange) {
    this._ranges.push(range);
  }

  clearRanges() {
    this._isRightToLeft = false;
    this._ranges = [];
  }

  getRangeAt(index: number) {
    return this._ranges[index];
  }

  /**
   * @return whether the selection is collapsed
   */
  get isCollapsed() {
    if (!(this.anchor && this.focus)) {
      return true;
    }
    return this.anchor.sameAs(this.focus);
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
    return this.calculateRdfaSelection(this.domSelection);
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
    const anchorNode = this.anchor?.parent;
    const focusNode = this.focus?.parent;

    if (!anchorNode) {
      throw new NotImplementedError("Cannot get textproperty of selection without anchorNode");
    }

    if (this.isCollapsed) {
      if (!ModelNode.isModelText(anchorNode)) {
        return PropertyState.unknown;
      }
      return anchorNode.getTextAttribute(property) ? PropertyState.enabled : PropertyState.disabled;
    } else {
      const nodeFinder = new ModelNodeFinder<ModelText>({
          startNode: anchorNode,
          endNode: focusNode,
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
    } else {
      this.focus = this.anchor;
    }
  }

  /**
   * Select a full ModelText node
   * @param node
   */
  selectNode(node: ModelNode) {
    this.clearRanges();
    const start = ModelPosition.fromParent(this.model.rootModelNode, node, 0);
    const end = ModelPosition.fromParent(this.model.rootModelNode, node, node.length);
    this.addRange(new ModelRange(start, end));
  }

  calculateRdfaSelection(selection: Selection) {
    if (selection.type === 'Caret') {
      if (!selection.anchorNode) {
        throw new SelectionError("Selection has no anchorNode");
      }
      return analyse(selection.anchorNode);
    } else {
      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;
      return analyse(commonAncestor);
    }

  }

}
