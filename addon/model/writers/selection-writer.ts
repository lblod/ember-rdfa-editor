import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import ModelSelection from '@lblod/ember-rdfa-editor/model/model-selection';
import {
  getWindowSelection,
  isElement,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ArrayUtils from '@lblod/ember-rdfa-editor/model/util/array-utils';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';

/**
 * Writer to convert a {@link ModelSelection} to a {@link Selection}
 * Note, unlike most writers, this is not a functional writer, since we cannot (or should not)
 * create a {@link Selection}
 */
export default class SelectionWriter implements Writer<ModelSelection, void> {
  private _model: Model;

  constructor(model: Model) {
    this._model = model;
  }

  write(modelSelection: ModelSelection): void {
    const domSelection = getWindowSelection();

    domSelection.removeAllRanges();
    for (const range of modelSelection.ranges) {
      domSelection.addRange(this.writeDomRange(range));
    }
    if (domSelection.anchorNode && isElement(domSelection.anchorNode)) {
      domSelection.anchorNode.scrollIntoView();
    }
  }

  /**
   * Convert a single {@link ModelRange} to a {@link Range}
   * @param range
   */
  writeDomRange(range: ModelRange): Range {
    const result = document.createRange();
    const startPos = this.writeDomPosition(range.start);
    const endPos = this.writeDomPosition(range.end);
    result.setStart(startPos.anchor, startPos.offset);
    result.setEnd(endPos.anchor, endPos.offset);

    return result;
  }

  /**
   * Convert a single {@link ModelPosition} to a DOM position.
   * (aka a {@link Node} and an offset).
   * @param position
   */
  writeDomPosition(position: ModelPosition): { anchor: Node; offset: number } {
    const nodeAfter = position.nodeAfter();
    const nodeBefore = position.nodeBefore();
    if (!nodeAfter) {
      const nodeView = this._model.modelToView(position.parent);
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
      const nodeView = this._model.modelToView(textAnchor);
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
      if (
        ModelElement.isModelElement(nodeAfter) ||
        ModelElement.isModelInlineComponent(nodeAfter)
      ) {
        const parentView = this._model.modelToView(position.parent);
        const nodeView = this._model.modelToView(nodeAfter);
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
