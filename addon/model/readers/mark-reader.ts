import Reader from '@lblod/ember-rdfa-editor/model/readers/reader';
import { tagName } from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import { HtmlTag } from '@lblod/ember-rdfa-editor/model/util/types';
import { TextAttribute } from '@lblod/ember-rdfa-editor/model/model-text';
import { HtmlReaderContext } from '@lblod/ember-rdfa-editor/model/readers/html-reader';
import HtmlNodeReader from '@lblod/ember-rdfa-editor/model/readers/html-node-reader';
import { KeyError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { pushOrExpand } from '@lblod/ember-rdfa-editor/model/util/array-utils';

/**
 * Reader responsible for reading HTML elements which we want to translate into text styles.
 */
export default class MarkReader
  implements Reader<HTMLElement, ModelNode[], HtmlReaderContext>
{
  static tagMap: Map<HtmlTag, TextAttribute> = new Map<HtmlTag, TextAttribute>([
    ['strong', 'bold'],
    ['b', 'bold'],
    ['i', 'italic'],
    ['em', 'italic'],
    ['u', 'underline'],
    ['del', 'strikethrough'],
  ]);

  read(from: HTMLElement, context: HtmlReaderContext): ModelNode[] {
    const attribute = MarkReader.tagMap.get(
      tagName(from) as HtmlTag
    );
    if (!attribute) {
      throw new KeyError(tagName(from));
    }
    const nodeReader = new HtmlNodeReader();
    context.textAttributes.set(attribute, 'true');
    const result: ModelNode[] = [];
    for (const child of from.childNodes) {
      const modelChild = nodeReader.read(child, context);
      if (modelChild) {
        pushOrExpand(result, modelChild);
      }
    }
    context.textAttributes.delete(attribute);
    return result;
  }
}
