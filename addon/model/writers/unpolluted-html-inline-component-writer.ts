import { ModelInlineComponent } from '../inline-components/model-inline-component';
import Model from '../model';
import HtmlInlineComponentWriter from './html-inline-component-writer';
import Writer from './writer';

export default class UnpollutedHtmlInlineComponentWriter
  implements Writer<ModelInlineComponent, Node>
{
  constructor(private model: Model) {}
  private inlineComponentWriter = new HtmlInlineComponentWriter();

  write(modelNode: ModelInlineComponent, child?: Node): Node {
    return this.inlineComponentWriter.write(modelNode, child).viewRoot;
  }
}
