import State from '@lblod/ember-rdfa-editor/core/state';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import {
  getWindowSelection,
  modelPosToDomPos,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';

/**
 * Writer to convert a {@link ModelSelection} to a {@link Selection}
 * Note, unlike most writers, this is not a functional writer, since we cannot (or should not)
 * create a {@link Selection}
 */
export default class SelectionWriter {
  write(
    state: State,
    viewRoot: Element,
    modelSelection: ModelSelection
  ): void {
    const domSelection = getWindowSelection();

    domSelection.removeAllRanges();
    for (const range of modelSelection.ranges) {
      domSelection.addRange(this.writeDomRange(state, viewRoot, range));
    }
  }

  /**
   * Convert a single {@link ModelRange} to a {@link Range}
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
    return { anchor, offset };
  }
}
