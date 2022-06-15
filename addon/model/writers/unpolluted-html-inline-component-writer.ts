import { ModelInlineComponent } from '../inline-components/model-inline-component';
import HtmlInlineComponentWriter from './html-inline-component-writer';
import Writer from './writer';

export default class UnpollutedHtmlInlineComponentWriter
  implements Writer<ModelInlineComponent, Node>
{
  private inlineComponentWriter = new HtmlInlineComponentWriter();

  write(modelNode: ModelInlineComponent): Node {
    return this.inlineComponentWriter.write(modelNode, false);
  }
}
