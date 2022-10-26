import {
  InlineComponentSpec,
  ModelInlineComponent,
  Properties,
  State,
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
    from.element.replaceChildren();
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

    context.registerNodeView(component, {
      viewRoot: element,
      contentRoot: element,
    });
    context.model.addComponentInstance(element, component.spec.name, component);
    return [component];
  }
}
