import { ModelInlineComponent } from '../inline-components/model-inline-component';
import NodeView from '../node-view';
import Writer from './writer';

export default class HtmlInlineComponentWriter
  implements Writer<ModelInlineComponent, NodeView | null>
{
  write(modelNode: ModelInlineComponent, dynamic = true): NodeView {
    const result = modelNode.write(dynamic);
    return { viewRoot: result, contentRoot: result };
  }
}
