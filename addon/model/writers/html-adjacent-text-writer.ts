import Writer from '@lblod/ember-rdfa-editor/model/writers/writer';
import Model from '@lblod/ember-rdfa-editor/model/model';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import {
  AdjacentTextView,
  TextView,
} from '@lblod/ember-rdfa-editor/model/node-view';
import {
  isTextOrElement,
  TextOrElement,
} from '@lblod/ember-rdfa-editor/model/util/types';
import { NotImplementedError } from '@lblod/ember-rdfa-editor/utils/errors';

/**
 * Writer responsible for converting {@link ModelText} nodes into HTML subtrees
 * This takes care of converting the textattributes into HTML elements
 */
export default class HtmlAdjacentTextWriter
  implements Writer<ModelText[], TextView[]>
{
  constructor(protected model: Model) {}

  write(modelNodes: ModelText[]): TextView[] {
    const textviews: TextView[] = modelNodes.map((modelNode) => {
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
      return { viewRoot: current, contentRoot: contentRoot };
    });
    return textviews;
  }
}
