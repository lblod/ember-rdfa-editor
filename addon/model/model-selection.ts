import Model from "@lblod/ember-rdfa-editor/model/model";
import {isElement} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import ModelText, {TextAttribute} from "@lblod/ember-rdfa-editor/model/model-text";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {NotImplementedError, SelectionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {analyse} from '@lblod/marawa/rdfa-context-scanner';
import ModelNodeFinder from "@lblod/ember-rdfa-editor/model/util/model-node-finder";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {Direction, FilterAndPredicate, PropertyState,} from "@lblod/ember-rdfa-editor/model/util/types";
import {listTypes} from "@lblod/ember-rdfa-editor/model/util/constants";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {FilterResult, ModelTreeWalker} from "@lblod/ember-rdfa-editor/model/util/tree-walker";

/**
 * Utility interface describing a selection with an non-null anchor and focus
 */
export interface WellbehavedSelection extends ModelSelection {
  anchor: ModelPosition;
  focus: ModelPosition;
  lastRange: ModelRange;

  getCommonAncestor(): ModelPosition;
}

/**
 * Just like the {@link Model} is a representation of the document, the ModelSelection is a representation
 * of the document selection.
 */
export default class ModelSelection {

  domSelection: Selection | null = null;
  private _ranges: ModelRange[];
  private model: Model;
  private _isRightToLeft: boolean;

  /**
   * Utility typeguard to check if a selection has and anchor and a focus, as without them
   * most operations that work on selections probably have no meaning.
   * @param selection
   */
  static isWellBehaved(selection: ModelSelection): selection is WellbehavedSelection {
    return !!(selection.anchor && selection.focus);
  }

  constructor(model: Model) {
    this.model = model;
    this._ranges = [];
    this._isRightToLeft = false;
  }

  /**
   * The focus is the leftmost position of the selection if the selection
   * is left-to-right, and the rightmost position otherwise
   */
  get focus(): ModelPosition | null {
    if (!this.lastRange) {
      return null;
    }
    if (this.isRightToLeft) {
      return this.lastRange.start;
    }
    return this.lastRange.end;
  }

  /**
   * The anchor is the rightmost position of the selection if the selection
   * is left-to-right, and the leftmost position otherwise
   */
  get anchor(): ModelPosition | null {
    if (!this.lastRange) {
      return null;
    }
    if (this.isRightToLeft) {
      return this.lastRange.end;
    }
    return this.lastRange.start;
  }

  /**
   * Get the last range. This range has a somewhat special function as it
   * determines the anchor and focus positions of the selection
   */
  get lastRange() {
    if (this._ranges.length) {
      return this._ranges[this._ranges.length - 1];
    } else {
      return null;
    }
  }

  /**
   * The selected {@link Range Ranges}
   */
  get ranges(): ModelRange[] {
    return this._ranges;
  }

  set ranges(value: ModelRange[]) {
    this._isRightToLeft = false;
    this._ranges = value;
  }

  /**
   * Whether the selection is right-to-left (aka backwards)
   */
  get isRightToLeft() {
    return this._isRightToLeft;
  }

  set isRightToLeft(value: boolean) {
    this._isRightToLeft = value;
  }


  /**
   * Append a range to this selection's ranges
   * @param range
   */
  addRange(range: ModelRange) {
    this._ranges.push(range);
  }

  /**
   * Remove all ranges of this selection
   */
  clearRanges() {
    this._isRightToLeft = false;
    this._ranges = [];
  }

  selectRange(range: ModelRange, rightToLeft: boolean = false) {
    this.clearRanges();
    this.addRange(range);
    this._isRightToLeft = rightToLeft;
  }

  /**
   * Gets the range at index
   * @param index
   */
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

  findAllInSelection<T extends ModelNode = ModelNode>(config: FilterAndPredicate<T>): Iterable<T> | null {

    const {filter, predicate} = config;

    if (!ModelSelection.isWellBehaved(this)) {
      return null;
    }

    // ignore selection direction
    const anchorNode = this.lastRange?.start.parent;
    const focusNode = this.lastRange?.end.parent;
    if (anchorNode === focusNode) {

      const noop = () => true;
      const filterFunc = filter || noop;
      const predicateFunc = predicate || noop;

      return {
        [Symbol.iterator]: (): Iterator<T> => {
          let done = false;
          return {
            next: (): IteratorResult<T, null> => {
              const value = anchorNode.findAncestor(node => filterFunc(node) && predicateFunc(node)) as T;
              if (value && !done) {
                done = true;
                return {
                  value,
                  done: false
                };

              } else {
                return {
                  value: null,
                  done: true
                };

              }
            }
          };
        }
      };
    } else {
      return new ModelNodeFinder<T>(
        {
          direction: Direction.FORWARDS,
          startNode: anchorNode,
          endNode: focusNode,
          rootNode: this.model.rootModelNode,
          nodeFilter: filter,
          useSiblingLinks: false,
          predicate
        }
      );
    }
  }

  findAllInSelectionOrAncestors<T extends ModelNode = ModelNode>(config: FilterAndPredicate<T>) {
    const noop = () => true;
    const filter = config.filter || noop;
    const predicate = config.predicate || noop;

    const iter = this.findAllInSelection(config);
    let result = iter && [...iter];
    if (!result || result.length === 0) {
      const secondTry = this.getCommonAncestor()?.parent.findAncestor(node => filter(node) && predicate(node));
      if (secondTry) {
        result = [secondTry as T];
      }
    }
    return result;
  }

  findFirstInSelection<T extends ModelNode = ModelNode>(config: FilterAndPredicate<T>): T | null {
    const iterator = this.findAllInSelection<T>(config);
    if (!iterator) {
      return null;
    }
    return iterator[Symbol.iterator]().next().value;

  }

  get isInList(): PropertyState {
    const config = {
      filter: ModelNode.isModelElement,
      predicate: (node: ModelElement) => listTypes.has(node.type),
    };
    let result = !!this.findFirstInSelection(config);
    if (!result) {
      result = !!this.getCommonAncestor()?.parent.findAncestor(node => ModelNode.isModelElement(node) && listTypes.has(node.type));
    }

    return result ? PropertyState.enabled : PropertyState.disabled;

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

  getCommonAncestor(): ModelPosition | null {
    if (!this.lastRange) {
      return null;
    }
    return this.lastRange.getCommonAncestor();
  }

  /**
   * Generic method for determining the status of a textattribute in the selection.
   * The status is as follows:
   * TODO: test this instead of writing it in comments, as this will inevitably get out of date
   *
   * collapsed selection
   * ----
   * in textnode with attribute -> ENABLED
   * in textnode without attribute -> DISABLED
   * not in textnode -> UNKNOWN
   *
   * uncollapsed selection
   * ----
   * all selected textnodes have attribute -> ENABLED
   * some selected textnodes have attribute, some don't -> UNKNOWN
   * none of the selected textnodes have attribute -> DISABLED
   *
   * @param property
   */
  getTextPropertyStatus(property: TextAttribute): PropertyState {
    const anchorNode = this.anchor?.parent;
    const focusNode = this.focus?.parent;


    if (ModelSelection.isWellBehaved(this)) {
      const range = this.lastRange!;

      const treeWalker = new ModelTreeWalker({
        range,
        filter: (node) => ModelNode.isModelText(node) && node.getTextAttribute(property) ? FilterResult.FILTER_ACCEPT : FilterResult.FILTER_SKIP
      });
      const result = Array.from(treeWalker);
      return result.length ? PropertyState.enabled : PropertyState.disabled;
    } else {
      return PropertyState.unknown;
    }
  }


  collapseOn(node: ModelNode, offset: number = 0) {
    this.clearRanges();
    const position = ModelPosition.fromParent(this.model.rootModelNode, node, offset);
    this.addRange(new ModelRange(position, position));
  }

  setStartAndEnd(start: ModelNode, startOffset: number, end: ModelNode, endOffset: number) {
    const range = ModelRange.fromParents(this.model.rootModelNode, start, startOffset, end, endOffset);
    this.clearRanges();
    this.addRange(range);
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
