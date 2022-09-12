import readHtmlElement from '@lblod/ember-rdfa-editor/model/readers/html-element-reader';
import ModelNode from '@lblod/ember-rdfa-editor/model/nodes/model-node';
import { HtmlReaderContext } from './html-reader';

export default function readHtmlSpan(
  from: HTMLSpanElement,
  context: HtmlReaderContext
): ModelNode[] {
  return readHtmlElement(from, context);
}
