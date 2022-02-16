import Reader from '@lblod/ember-rdfa-editor/model/readers/reader';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { HtmlReaderContext } from '@lblod/ember-rdfa-editor/model/readers/html-reader';

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
    // Use ECMA-262 Edition 3 String and RegExp features
    // trimmed = trimmed.replace(/[\t\n\r ]+/g, ' ');
    const pattern = /[\f\n\r\t\v ]{2,}/g;
    const replacement = ' ';

    trimmed = trimmed.replace(pattern, replacement);
    if (trimmed.charAt(0) == ' ') {
      trimmed = trimmed.substring(1, trimmed.length);
    }
    if (!trimmed.length) {
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
