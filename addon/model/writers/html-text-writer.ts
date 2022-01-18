import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { TextAttribute } from '@lblod/ember-rdfa-editor/commands/text-properties/set-property-command';

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class HtmlTextWriter implements Writer<ModelText, Node | null> {
  static attributeMap: Map<TextAttribute, keyof HTMLElementTagNameMap> =
    new Map<TextAttribute, keyof HTMLElementTagNameMap>([
      ['bold', 'strong'],
      ['italic', 'em'],
      ['underline', 'u'],
      ['strikethrough', 'del'],
      ['highlighted', 'span'],
    ]);

  constructor(protected model: Model) {}

  get attributeMap() {
    return HtmlTextWriter.attributeMap;
  }

  write(modelNode: ModelText): Node | null {
    if (modelNode.length === 0) {
      return null;
    }

    let current: Node = new Text(modelNode.content);
    this.model.bindNode(modelNode, current);

    for (const entry of [...modelNode.marks].sort((a, b) =>
      a.priority >= b.priority ? 1 : -1
    )) {
      current = entry.write(current);
    }
    return current;
  }

  firstLeafNode(node: Element) {
    let current: Node = node;
    while (current.firstChild) {
      current = current.firstChild;
    }
    return current;
  }
}
