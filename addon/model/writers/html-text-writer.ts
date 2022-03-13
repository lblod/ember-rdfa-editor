import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class HtmlTextWriter implements Writer<ModelText, Node> {
  constructor(protected model: Model) {}

  write(modelNode: ModelText): Node {
    if (modelNode.length === 0) {
      return new Text();
    }

    let current: Node = new Text(modelNode.content);
    this.model.registerNodeView(modelNode, current);

    for (const entry of [...modelNode.marks].sort((a, b) =>
      a.priority >= b.priority ? 1 : -1
    )) {
      current = entry.write(current);
    }
    return current;
  }
}
