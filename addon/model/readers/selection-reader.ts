import State from '@lblod/ember-rdfa-editor/core/state';
import { MarkSet } from '@lblod/ember-rdfa-editor/model/mark';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { domPosToModelPos } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';

/**
 * Reader to convert a {@link Selection} to a {@link ModelSelection}.
 */
export default class SelectionReader {
  read(state: State, viewRoot: Element, from: Selection): ModelSelection {
    const ranges = [];
    const result = new ModelSelection();

    let commonMarks: MarkSet | null = null;
    for (let i = 0; i < from.rangeCount; i++) {
      const range = from.getRangeAt(i);
      const modelRange = this.readDomRange(state, viewRoot, range);
      if (modelRange) {
        commonMarks = commonMarks
          ? commonMarks.intersection(modelRange.getMarks())
          : modelRange.getMarks();
        ranges.push(modelRange);
      }
    }
    result.ranges = ranges;
    result.isRightToLeft = SelectionReader.isReverseSelection(from);
    result.activeMarks = commonMarks || new MarkSet();

    return result;
  }

  /**
   * Convert a {@link Range} to a {@link ModelRange}.
   * Can be null when the {@link Selection} is empty.
   * @param state
   * @param viewRoot
   * @param range
   */
  readDomRange(
    state: State,
    viewRoot: Element,
    range: StaticRange
  ): ModelRange | null {
    const start = this.readDomPosition(
      state,
      viewRoot,
      range.startContainer,
      range.startOffset
    );
    if (!start) {
      return null;
    }

    if (range.collapsed) {
      return new ModelRange(start);
    }

    const end = this.readDomPosition(
      state,
      viewRoot,
      range.endContainer,
      range.endOffset
    );
    return new ModelRange(start, end ?? start);
  }

  /**
   * Convert a DOM position to a {@link ModelPosition}.
   * Can be null when the {@link Selection} is empty.
   * @param state
   * @param viewRoot
   * @param container
   * @param domOffset
   */
  readDomPosition(
    state: State,
    viewRoot: Element,
    container: Node,
    domOffset: number
  ): ModelPosition | null {
    try {
      return this.readDomPositionUnsafe(state, viewRoot, container, domOffset);
    } catch (e) {
      if (e instanceof ModelError) {
        console.warn(e.message);
        return null;
      } else {
        throw e;
      }
    }
  }

  private readDomPositionUnsafe(
    state: State,
    viewRoot: Element,
    container: Node,
    domOffset: number
  ): ModelPosition | null {
    return domPosToModelPos(state, viewRoot, container, domOffset);
  }

  /**
   * Check if selection is backwards (aka right-to-left).
   * Taken from the internet.
   * @param selection
   * @private
   */
  static isReverseSelection(selection: Selection): boolean {
    if (!selection.anchorNode || !selection.focusNode) {
      return false;
    }
    const range = selection.getRangeAt(0);
    const startIsFocus =
      range.startContainer === selection.focusNode &&
      range.startOffset === selection.focusOffset;
    const endIsAnchor =
      range.endContainer === selection.anchorNode &&
      range.endOffset === selection.anchorOffset;

    return startIsFocus && endIsAnchor;
  }
}
