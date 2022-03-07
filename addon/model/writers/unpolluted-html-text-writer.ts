import HtmlTextWriter from '@lblod/ember-rdfa-editor/model/writers/html-text-writer';
import { preWrapToNormalWhiteSpace } from '@lblod/ember-rdfa-editor/utils/whitespace-collapsing';
import ModelText from '../model-text';

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class UnpollutedHtmlTextWriter extends HtmlTextWriter {
  write(modelNode: ModelText): Node | null {
    const clone = modelNode.clone();
    clone.content = preWrapToNormalWhiteSpace(modelNode.content);
    const current = super.write(clone);
    return current;
  }
}
