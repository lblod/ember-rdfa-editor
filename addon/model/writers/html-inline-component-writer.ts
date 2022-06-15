import { ModelInlineComponent } from '../inline-components/model-inline-component';
import Writer from './writer';

export default class HtmlInlineComponentWriter
  implements Writer<ModelInlineComponent, Node>
{
  write(modelNode: ModelInlineComponent, dynamic = true): Node {
    const result = modelNode.write(dynamic);
    return result;
  }
}
