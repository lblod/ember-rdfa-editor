import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { normalToPreWrapWhiteSpace } from '@lblod/ember-rdfa-editor/utils/whitespace-collapsing';
import { HtmlReaderContext } from './html-reader';

/**
 * Reader responsible for reading HTML Text nodes
 */

export default function readHtmlText(
  from: Text,
  context: HtmlReaderContext
): ModelText[] {
  if (!from.textContent) {
    return [];
  }

  let trimmed = from.textContent;
  if (context.shouldConvertWhitespace) {
    trimmed = normalToPreWrapWhiteSpace(from);
  }

  if (trimmed.length == 0) {
    return [];
  }

  const result = new ModelText(trimmed);
  context.activeMarks.forEach(({ spec, attributes }) =>
    context.addMark(result, spec, attributes)
  );
  return [result];
}
