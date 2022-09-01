import {
  InlineComponentSpec,
  ModelInlineComponent,
  Properties,
  State,
} from '../inline-components/model-inline-component';

export default function readHtmlInlineComponent(
  element: HTMLElement,
  spec: InlineComponentSpec
) {
  const propsAttribute = element.dataset['__props'];
  let props: Properties = {};
  if (propsAttribute) {
    props = JSON.parse(propsAttribute) as Properties;
  }
  const stateAttribute = element.dataset['__state'];
  let state: State = {};
  if (stateAttribute) {
    state = JSON.parse(stateAttribute) as State;
  }
  const component = new ModelInlineComponent(spec, props, state);
  return [component];
}
