import Reader from '@lblod/ember-rdfa-editor/model/readers/reader';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { HtmlReaderContext } from '@lblod/ember-rdfa-editor/model/readers/html-reader';
import { normalToPreWrapWhiteSpace } from '@lblod/ember-rdfa-editor/utils/whitespace-collapsing';

/**
 * Reader responsible for reading HTML Text nodes
 */
export default class HtmlTextReader
  implements Reader<Text, ModelText[], HtmlReaderContext>
{
  read(from: Text, context: HtmlReaderContext): ModelText[] {
    if (!from.textContent) {
      return [];
    }

    let trimmed = from.textContent;
    if (context.shouldConvertWhitespace) {
      trimmed = normalToPreWrapWhiteSpace(trimmed);
    }

    if (trimmed.length == 0) {
      return [];
    }

    const result = new ModelText(trimmed);
    context.activeMarks.forEach(({ spec, attributes }) =>
      context.addMark(result, spec, attributes)
    );
    context.bindNode(result, from);
    return [result];
  }
}
