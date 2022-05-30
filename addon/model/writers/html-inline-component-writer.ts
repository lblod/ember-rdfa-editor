import {
  ModelInlineComponent,
  Properties,
} from '../inline-components/model-inline-component';
import NodeView from '../node-view';
import Writer from './writer';

export default class HtmlInlineComponentWriter
  implements Writer<ModelInlineComponent<Properties>, NodeView | null>
{
  write(modelNode: ModelInlineComponent<Properties>): NodeView {
    const result = modelNode.write();
    return { viewRoot: result, contentRoot: result };
  }
}
