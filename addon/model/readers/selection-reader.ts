import Reader from '@lblod/ember-rdfa-editor/model/readers/reader';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import {
  isElement,
  isTextNode,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import {
  ModelError,
  NotImplementedError,
} from '@lblod/ember-rdfa-editor/utils/errors';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { MarkSet } from '@lblod/ember-rdfa-editor/model/mark';

type Bias = 'left' | 'right' | 'center';

/**
 * Reader to convert a {@link Selection} to a {@link ModelSelection}.
 */
export default class SelectionReader
  implements Reader<Selection, ModelSelection, void>
{
  private model: Model;

  constructor(model: Model) {
    this.model = model;
  }

  read(from: Selection): ModelSelection {
    const ranges = [];
    const result = new ModelSelection();

    let commonMarks: MarkSet | null = null;
    for (let i = 0; i < from.rangeCount; i++) {
      const range = from.getRangeAt(i);
      const modelRange = this.readDomRange(range);
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
   * @param range
   */
  readDomRange(range: Range): ModelRange | null {
    const start = this.readDomPosition(range.startContainer, range.startOffset);
    if (!start) {
      return null;
    }

    if (range.collapsed) {
      return new ModelRange(start);
    }

    const end = this.readDomPosition(range.endContainer, range.endOffset);
    return new ModelRange(start, end ?? start);
  }

  /**
   * Convert a DOM position to a {@link ModelPosition}.
   * Can be null when the {@link Selection} is empty.
   * @param container
   * @param domOffset
   */
  readDomPosition(container: Node, domOffset: number): ModelPosition | null {
    try {
      return this.readDomPositionUnsafe(container, domOffset);
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
    container: Node,
    domOffset: number,
    bias: Bias = 'right'
  ): ModelPosition | null {
    const modelNode = this.model.viewToModel(container);
    const nodeView = this.model.modelToView(modelNode);
    if (!nodeView) {
      throw new ModelError('Could not find nodeview for domNode');
    }

    if (nodeView.contentRoot.contains(container)) {
      // dom selection is inside some content-node we control, this
      // means we can build a "real" model selection
      return this.readContentPosition(container, modelNode, domOffset);
    } else {
      // dom selection is outside of the content
      // we return some position either in front or after the modelnode
      // based on heuristics and influenced by bias
      if (bias === 'right') {
        return ModelPosition.fromAfterNode(modelNode);
      } else {
        return ModelPosition.fromBeforeNode(modelNode);
      }
    }
  }

  private readContentPosition(
    container: Node,
    modelNode: ModelNode,
    domOffset: number
  ): ModelPosition {
    if (isTextNode(container) && ModelNode.isModelText(modelNode)) {
      return ModelPosition.fromInTextNode(modelNode, domOffset);
    } else if (isElement(container) && ModelNode.isModelElement(modelNode)) {
      if (modelNode.children.length) {
        return ModelPosition.fromInElement(
          modelNode,
          modelNode.indexToOffset(domOffset)
        );
      } else {
        if (domOffset === 0) {
          // Setting a cursor inside an element without height leads to invisible
          // cursor, so work around it
          // note I haven't been able to even reproduce this case
          if (!modelNode.parent) {
            // in case the node is root, there's not much we can do
            return ModelPosition.fromInNode(modelNode, 0);
          } else {
            // otherwise default to setting it in front of the element
            return ModelPosition.fromBeforeNode(modelNode);
          }
        } else {
          throw new NotImplementedError();
        }
      }
    } else {
      throw new NotImplementedError('impossible selection');
    }
  }

  /**
   * Check if selection is backwards (aka right-to-left).
   * Taken from the internet.
   * @param selection
   * @private
   */
  private static isReverseSelection(selection: Selection): boolean {
    if (!selection.anchorNode || !selection.focusNode) return false;
    const position = selection.anchorNode.compareDocumentPosition(
      selection.focusNode
    );

    // Position == 0 if nodes are the same.
    return (
      (!position && selection.anchorOffset > selection.focusOffset) ||
      position === Node.DOCUMENT_POSITION_PRECEDING
    );
  }
}
