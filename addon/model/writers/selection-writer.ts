import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import { getWindowSelection } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ArrayUtils from '@lblod/ember-rdfa-editor/model/util/array-utils';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { View } from '@lblod/ember-rdfa-editor/core/view';

/**
 * Writer to convert a {@link ModelSelection} to a {@link Selection}
 * Note, unlike most writers, this is not a functional writer, since we cannot (or should not)
 * create a {@link Selection}
 */
export default class SelectionWriter {
  write(view: View, modelSelection: ModelSelection): void {
    const domSelection = getWindowSelection();

    domSelection.removeAllRanges();
    for (const range of modelSelection.ranges) {
      domSelection.addRange(this.writeDomRange(view, range));
    }
  }

  /**
   * Convert a single {@link ModelRange} to a {@link Range}
   * @param range
   */
  writeDomRange(view: View, range: ModelRange): Range {
    const result = document.createRange();
    const startPos = this.writeDomPosition(view, range.start);
    const endPos = this.writeDomPosition(view, range.end);
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
    view: View,
    position: ModelPosition
  ): { anchor: Node; offset: number } {
    const nodeAfter = position.nodeAfter();
    const nodeBefore = position.nodeBefore();
    if (!nodeAfter) {
      const nodeView = view.modelToView(position.parent);
      if (!nodeView) {
        throw new ModelError(
          'Writing selection of modelNode which is not in dom'
        );
      }
      return {
        anchor: nodeView.contentRoot,
        offset: nodeView.contentRoot.childNodes.length,
      };
    }
    let textAnchor: ModelText | null = null;
    if (ModelElement.isModelText(nodeAfter)) {
      textAnchor = nodeAfter;
    } else if (ModelElement.isModelText(nodeBefore)) {
      textAnchor = nodeBefore;
    }
    if (textAnchor) {
      const nodeView = view.modelToView(textAnchor);
      if (!nodeView) {
        throw new ModelError(
          'Writing selection of modelNode which is not in dom'
        );
      }
      return {
        anchor: nodeView.contentRoot,
        offset: position.parentOffset - textAnchor.getOffset(),
      };
    } else {
      if (ModelElement.isModelElement(nodeAfter)) {
        const parentView = view.modelToView(position.parent);
        const nodeView = view.modelToView(nodeAfter);
        if (!nodeView || !parentView) {
          throw new ModelError(
            'Writing selection of modelNode which is not in dom'
          );
        }

        const domAnchor = parentView.contentRoot;
        const domIndex = ArrayUtils.indexOf(
          nodeView.contentRoot,
          (domAnchor as HTMLElement).childNodes
        )!;
        return { anchor: parentView.contentRoot, offset: domIndex };
      } else {
        throw new ModelError('Unsupported node type');
      }
    }
  }
}
