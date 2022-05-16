import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { SelectionError } from '@lblod/ember-rdfa-editor/utils/errors';
import { analyse } from '@lblod/marawa/rdfa-context-scanner';
import ModelNodeFinder from '@lblod/ember-rdfa-editor/model/util/model-node-finder';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import {
  Direction,
  FilterAndPredicate,
  PropertyState,
} from '@lblod/ember-rdfa-editor/model/util/types';
import { nodeIsElementOfType } from '@lblod/ember-rdfa-editor/model/util/predicate-utils';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { compatTextAttributeMap } from '@lblod/ember-rdfa-editor/model/util/constants';
import { TextAttribute } from '@lblod/ember-rdfa-editor/commands/text-properties/set-text-property-command';
import { Mark, MarkSet } from '@lblod/ember-rdfa-editor/model/mark';

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
  private _isRightToLeft: boolean;
  private _activeMarks: MarkSet;

  /**
   * Utility type guard to check if a selection has and anchor and a focus, as without them
   * most operations that work on selections probably have no meaning.
   * @param selection
   */
  static isWellBehaved(
    selection: ModelSelection
  ): selection is WellbehavedSelection {
    return !!(selection.anchor && selection.focus);
  }

  constructor() {
    this._ranges = [];
    this._isRightToLeft = false;
    this._activeMarks = new MarkSet();
  }

  /**
   * The focus is the leftmost position of the selection if the selection
   * is left-to-right, and the rightmost position otherwise.
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
   * is left-to-right, and the leftmost position otherwise.
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
   * determines the anchor and focus positions of the selection.
   */
  get lastRange() {
    if (this._ranges.length) {
      return this._ranges[this._ranges.length - 1];
    } else {
      return null;
    }
  }

  /**
   * The selected {@link Range ranges}.
   */
  get ranges(): ModelRange[] {
    return this._ranges;
  }

  set ranges(value: ModelRange[]) {
    this._isRightToLeft = false;
    this._ranges = value;
  }

  /**
   * Whether the selection is right-to-left (aka backwards).
   */
  get isRightToLeft() {
    return this._isRightToLeft;
  }

  set isRightToLeft(value: boolean) {
    this._isRightToLeft = value;
  }

  get activeMarks(): MarkSet {
    return this._activeMarks;
  }

  set activeMarks(value: MarkSet) {
    this._activeMarks = value.clone();
  }

  addMark(mark: Mark) {
    this.activeMarks.add(mark);
  }

  removeMarkByName(markName: string) {
    for (const mark of this.activeMarks) {
      if (mark.name === markName) {
        this.activeMarks.delete(mark);
      }
    }
  }

  /**
   * Append a range to this selection's ranges.
   * @param range
   */
  addRange(range: ModelRange) {
    this._ranges.push(range);
  }

  /**
   * Remove all ranges of this selection.
   */
  clearRanges() {
    this._isRightToLeft = false;
    this._ranges = [];
  }

  selectRange(range: ModelRange, rightToLeft = false) {
    this.clearRanges();
    this.addRange(range);
    this.activeMarks = range.getMarks();
    this._isRightToLeft = rightToLeft;
  }

  /**
   * Gets the range at index.
   * @param index
   */
  getRangeAt(index: number) {
    return this._ranges[index];
  }

  /**
   * @return boolean Whether the selection is collapsed.
   */
  get isCollapsed() {
    return this.lastRange?.collapsed;
  }

  get bold(): PropertyState {
    return this.getTextPropertyStatus('bold');
  }

  get italic(): PropertyState {
    return this.getTextPropertyStatus('italic');
  }

  get underline(): PropertyState {
    return this.getTextPropertyStatus('underline');
  }

  get strikethrough(): PropertyState {
    return this.getTextPropertyStatus('strikethrough');
  }

  /**
   * @param {FilterAndPredicate<T>} config
   * @deprecated Use {@link ModelTreeWalker} instead.
   */
  findAllInSelection<T extends ModelNode = ModelNode>(
    config: FilterAndPredicate<T>
  ): Iterable<T> | null {
    const { filter, predicate } = config;

    const range = this.lastRange;
    if (!range) {
      return null;
    }

    // Ignore selection direction.
    const anchorNode = range.start.parent;
    const focusNode = range.end.parent;

    if (anchorNode === focusNode) {
      const noop = () => true;
      const filterFunc = filter || noop;
      const predicateFunc = predicate || noop;

      return {
        [Symbol.iterator]: (): Iterator<T> => {
          let done = false;
          return {
            next: (): IteratorResult<T, null> => {
              const value = anchorNode.findAncestor(
                (node) => filterFunc(node) && predicateFunc(node)
              ) as T;
              if (value && !done) {
                done = true;
                return {
                  value,
                  done: false,
                };
              } else {
                return {
                  value: null,
                  done: true,
                };
              }
            },
          };
        },
      };
    } else {
      return new ModelNodeFinder<T>({
        direction: Direction.FORWARDS,
        startNode: anchorNode,
        endNode: focusNode,
        rootNode: range.root,
        nodeFilter: filter,
        useSiblingLinks: false,
        predicate,
      });
    }
  }

  get inListState(): PropertyState {
    if (ModelSelection.isWellBehaved(this)) {
      const range = this.lastRange;
      const predicate = nodeIsElementOfType('li', 'ul', 'ol');
      const result =
        range.containsNodeWhere(predicate) ||
        range.hasCommonAncestorWhere(predicate);
      return result ? PropertyState.enabled : PropertyState.disabled;
    } else {
      return PropertyState.unknown;
    }
  }

  get inTableState(): PropertyState {
    if (ModelSelection.isWellBehaved(this)) {
      const range = this.lastRange;
      const predicate = nodeIsElementOfType('table');
      const result =
        range.containsNodeWhere(predicate) ||
        range.hasCommonAncestorWhere(predicate);
      return result ? PropertyState.enabled : PropertyState.disabled;
    } else {
      return PropertyState.unknown;
    }
  }

  get rdfaSelection() {
    if (!this.domSelection) return;
    return this.calculateRdfaSelection(this.domSelection);
  }

  get subtree() {
    if (!this.domSelection) {
      return;
    }

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
    return this.lastRange.getCommonPosition();
  }

  hasMark(markName: string): boolean {
    return this.activeMarks.hasMarkName(markName);
  }

  /**
   * @deprecated use {@link hasMark}
   * Generic method for determining the status of a text attribute in the selection.
   * @param property
   */
  getTextPropertyStatus(property: TextAttribute): PropertyState {
    if (ModelSelection.isWellBehaved(this)) {
      const specAttributes = compatTextAttributeMap.get(property);
      if (specAttributes) {
        return this.hasMark(specAttributes.spec.name)
          ? PropertyState.enabled
          : PropertyState.disabled;
      }
    }
    return PropertyState.unknown;
  }

  collapseIn(node: ModelNode, offset = 0) {
    this.clearRanges();
    this.addRange(ModelRange.fromInNode(node, offset, offset));
  }

  setStartAndEnd(
    start: ModelNode,
    startOffset: number,
    end: ModelNode,
    endOffset: number
  ) {
    const startPos = ModelPosition.fromInNode(start, startOffset);
    const endPos = ModelPosition.fromInNode(end, endOffset);
    const range = new ModelRange(startPos, endPos);
    this.clearRanges();
    this.addRange(range);
  }

  calculateRdfaSelection(selection: Selection) {
    if (selection.type === 'Caret') {
      if (!selection.anchorNode) {
        throw new SelectionError('Selection has no anchorNode');
      }
      return analyse(selection.anchorNode);
    } else {
      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;
      return analyse(commonAncestor);
    }
  }

  clone(modelRoot?: ModelElement) {
    const modelSelection = new ModelSelection();
    modelSelection.isRightToLeft = this._isRightToLeft;
    modelSelection.ranges = this.ranges.map((range) => range.clone(modelRoot));

    return modelSelection;
  }
}
