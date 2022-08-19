import {
  getWindowSelection,
  isElement,
  modelPosToDomPos,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import State from '@lblod/ember-rdfa-editor/core/state';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';

/**
 * Writer to convert a {@link ModelSelection} to a {@link Selection}
 * Note, unlike most writers, this is not a functional writer, since we cannot (or should not)
 * create a {@link Selection}
 */
export default class SelectionWriter {
  write(
    state: State,
    viewRoot: Element,
    modelSelection: ModelSelection,
    moveSelectionIntoView = false
  ): void {
    const domSelection = getWindowSelection();
    const relevantRange = modelSelection.lastRange;
    if (!relevantRange) {
      return;
    }

    const { anchor: startAnchor, offset: startOffset } = this.writeDomPosition(
      state,
      viewRoot,
      relevantRange.start
    );
    const { anchor: endAnchor, offset: endOffset } = this.writeDomPosition(
      state,
      viewRoot,
      relevantRange.end
    );

    if (modelSelection.isRightToLeft) {
      domSelection.setBaseAndExtent(
        endAnchor,
        endOffset,
        startAnchor,
        startOffset
      );
    } else {
      domSelection.setBaseAndExtent(
        startAnchor,
        startOffset,
        endAnchor,
        endOffset
      );
    }
    if (domSelection.anchorNode && moveSelectionIntoView) {
      if (isElement(domSelection.anchorNode)) {
        domSelection.anchorNode.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      } else {
        domSelection.anchorNode.parentElement?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }

  /**
   * Convert a single {@link ModelRange} to a {@link Range}
   * @param state
   * @param viewRoot
   * @param range
   */
  writeDomRange(state: State, viewRoot: Element, range: ModelRange): Range {
    const result = document.createRange();
    const startPos = this.writeDomPosition(state, viewRoot, range.start);
    const endPos = this.writeDomPosition(state, viewRoot, range.end);
    result.setStart(startPos.anchor, startPos.offset);
    result.setEnd(endPos.anchor, endPos.offset);

    return result;
  }

  /**
   * Convert a single {@link ModelPosition} to a DOM position.
   * (aka a {@link Node} and an offset).
   * @param state
   * @param viewRoot
   * @param position
   */
  writeDomPosition(
    state: State,
    viewRoot: Element,
    position: ModelPosition
  ): { anchor: Node; offset: number } {
    const { container: anchor, offset } = modelPosToDomPos(
      state,
      viewRoot,
      position
    );
    return { anchor, offset: offset ?? 0 };
  }
}
