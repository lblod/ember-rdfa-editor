import ModelNode from '@lblod/ember-rdfa-editor/model/nodes/model-node';
import { WriterError } from '@lblod/ember-rdfa-editor/utils/errors';
import writeUnpollutedHtmlElement from './unpolluted-html-element-writer';
import writeUnpollutedHtmlInlineComponent from './unpolluted-html-inline-component-writer';
import writeUnpollutedHtmlText from './unpolluted-html-text-writer';

export default function writeExportedHtml(modelNode: ModelNode): Node {
  let result = null;

  if (ModelNode.isModelElement(modelNode)) {
    result = writeUnpollutedHtmlElement(modelNode);
    for (const child of modelNode.children) {
      result.appendChild(writeExportedHtml(child));
    }
  } else if (ModelNode.isModelText(modelNode)) {
    result = writeUnpollutedHtmlText(modelNode);
  } else if (ModelNode.isModelInlineComponent(modelNode)) {
    result = writeUnpollutedHtmlInlineComponent(modelNode);
  } else {
    throw new WriterError('Unsupported node type');
  }

  if (!result) {
    result = new Text();
  }

  return result;
}
