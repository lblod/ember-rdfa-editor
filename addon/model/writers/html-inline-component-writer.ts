import { ModelInlineComponent } from '../inline-components/model-inline-component';

export function writeHtmlInlineComponent(
  modelNode: ModelInlineComponent,
  dynamic = true
): Node {
  const result = modelNode.write(dynamic);
  return result;
}
