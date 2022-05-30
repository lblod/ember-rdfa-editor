import {
  ModelInlineComponent,
  Properties,
} from '../inline-components/model-inline-component';
import Model from '../model';
import NodeView from '../node-view';
import Writer from './writer';

export default class HtmlInlineComponentWriter
  implements Writer<ModelInlineComponent<Properties>, NodeView | null>
{
  constructor(private model: Model) {}

  write(modelNode: ModelInlineComponent<Properties>): NodeView {
    const result = modelNode.write();
    this.model.addComponentInstance(
      result,
      modelNode.spec.name,
      modelNode.props
    );
    return { viewRoot: result, contentRoot: result };
  }
}
