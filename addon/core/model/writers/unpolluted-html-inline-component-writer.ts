import { ModelInlineComponent } from '../inline-components/model-inline-component';
import writeHtmlInlineComponent from './html-inline-component-writer';

export default function writeUnpollutedHtmlInlineComponent(
  modelNode: ModelInlineComponent
): Node {
  return writeHtmlInlineComponent(modelNode, false);
}
