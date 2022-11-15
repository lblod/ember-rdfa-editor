import {
  InlineComponentSpec,
  ModelInlineComponent,
  Properties,
} from '../inline-components/model-inline-component';
import { HtmlReaderContext } from './html-reader';
import Reader from './reader';

export default class HtmlInlineComponentReader
  implements
    Reader<
      { element: HTMLElement; spec: InlineComponentSpec },
      ModelInlineComponent[],
      HtmlReaderContext
    >
{
  read(
    from: { element: HTMLElement; spec: InlineComponentSpec },
    context: HtmlReaderContext
  ): ModelInlineComponent[] {
    const { element, spec } = from;
    // For legacy reasons we still need to check if the element has a __props dataset attribute
    const propsAttribute =
      element.dataset['props'] ?? element.dataset['__props'];
    let props: Properties = {};
    if (propsAttribute) {
      props = JSON.parse(propsAttribute) as Properties;
    }
    // For legacy reasons we still need to check if the element has a __state dataset attribute
    const stateAttribute = element.dataset['__state'];
    if (stateAttribute) {
      const state = JSON.parse(stateAttribute) as Properties;
      props = { ...props, ...state };
    }
    const component = new ModelInlineComponent(spec, props);

    context.registerNodeView(component, {
      viewRoot: element,
      contentRoot: element,
    });
    context.model.addComponentInstance(element, component.spec.name, component);
    return [component];
  }
}
