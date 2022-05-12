import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelNode from '../model/model-node';
import ModelPosition from '../model/model-position';
import { isElement, isTextNode } from '../utils/dom-helpers';
import { ModelError, NotImplementedError } from '../utils/errors';

export function readRange(state: State, range: StaticRange): ModelRange {}

/**
 * Convert a {@link Range} to a {@link ModelRange}.
 * Can be null when the {@link Selection} is empty.
 * @param range
 */
function readDomRange(range: Range): ModelRange | null {
  const start = readDomPosition(range.startContainer, range.startOffset);
  if (!start) {
    return null;
  }

  if (range.collapsed) {
    return new ModelRange(start);
  }

  const end = readDomPosition(range.endContainer, range.endOffset);
  return new ModelRange(start, end ?? start);
}

/**
 * Convert a DOM position to a {@link ModelPosition}.
 * Can be null when the {@link Selection} is empty.
 * @param container
 * @param domOffset
 */
function readDomPosition(
  container: Node,
  domOffset: number
): ModelPosition | null {
  try {
    return readDomPositionUnsafe(container, domOffset);
  } catch (e) {
    if (e instanceof ModelError) {
      console.warn(e.message);
      return null;
    } else {
      throw e;
    }
  }
}

function readDomPositionUnsafe(
  container: Node,
  domOffset: number,
  bias: Bias = 'right'
): ModelPosition | null {
  const modelNode = model.viewToModel(container);
  const nodeView = model.modelToView(modelNode);
  if (!nodeView) {
    throw new ModelError('Could not find nodeview for domNode');
  }

  if (nodeView.contentRoot.contains(container)) {
    // dom selection is inside some content-node we control, this
    // means we can build a "real" model selection
    return readContentPosition(container, modelNode, domOffset);
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

function readContentPosition(
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
function isReverseSelection(selection: Selection): boolean {
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
