import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import {
  isTextOrElement,
  TextOrElement,
} from '@lblod/ember-rdfa-editor/model/util/types';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/errors';

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default function writeHtmlText(modelNode: ModelText): TextOrElement {
  const contentRoot: Text = new Text(modelNode.content);
  let current: TextOrElement = contentRoot;

  for (const entry of [...modelNode.marks].sort((a, b) =>
    a.priority >= b.priority ? 1 : -1
  )) {
    const rendered = entry.write(current);
    if (isTextOrElement(rendered)) {
      current = rendered;
    } else {
      throw new NotImplementedError(
        'Mark is trying to render as something other than an element or a text node'
      );
    }
  }
  return current;
}
