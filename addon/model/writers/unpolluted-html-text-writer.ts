import HtmlTextWriter from '@lblod/ember-rdfa-editor/model/writers/html-text-writer';
import { preWrapToNormalWhiteSpace } from '@lblod/ember-rdfa-editor/utils/whitespace-collapsing';
import ModelText from '../model-text';
import Model from '@lblod/ember-rdfa-editor/model/model';

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class UnpollutedHtmlTextWriter {
  constructor(private model: Model) {}

  private textWriter = new HtmlTextWriter(this.model);

  write(modelNode: ModelText): Node {
    const clone = modelNode.clone();
    clone.content = preWrapToNormalWhiteSpace(modelNode.content);
    const current = this.textWriter.write(clone).viewRoot;
    return current;
  }
}
