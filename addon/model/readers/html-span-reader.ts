import Reader from '@lblod/ember-rdfa-editor/model/readers/reader';
import HtmlElementReader from '@lblod/ember-rdfa-editor/model/readers/html-element-reader';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { HtmlReaderContext } from './html-reader';

export default class HtmlSpanReader
  implements Reader<HTMLSpanElement, ModelNode[], HtmlReaderContext>
{
  read(from: HTMLSpanElement, context: HtmlReaderContext): ModelNode[] {
    const elementReader = new HtmlElementReader();
    return elementReader.read(from, context);
  }
}
