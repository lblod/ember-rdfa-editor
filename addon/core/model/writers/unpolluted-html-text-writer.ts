import writeHtmlText from '@lblod/ember-rdfa-editor/core/model/writers/html-text-writer';
import { preWrapToNormalWhiteSpace } from '@lblod/ember-rdfa-editor/utils/whitespace-collapsing';
import ModelText from '../nodes/model-text';

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */

export default function writeUnpollutedHtmlText(modelNode: ModelText): Node {
  const clone = modelNode.clone();
  clone.content = preWrapToNormalWhiteSpace(modelNode.content);
  const current = writeHtmlText(clone);
  return current;
}
