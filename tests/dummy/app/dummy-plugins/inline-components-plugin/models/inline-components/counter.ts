import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import {
  InlineComponentSpec,
  Properties,
  State,
} from '@lblod/ember-rdfa-editor/core/model/inline-components/model-inline-component';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';

export default class CounterSpec extends InlineComponentSpec {
  matcher = {
    tag: this.tag,
    attributeBuilder: (node: Node) => {
      if (isElement(node)) {
        if (
          node.classList.contains('inline-component') &&
          node.classList.contains(this.name)
        ) {
          return {};
        }
      }
      return null;
    },
  };
  _renderStatic(_props: Properties, state: State) {
    const count = state.count?.toString() || '0';
    return `
      <p>${count}</p>
    `;
  }
  constructor(controller: Controller) {
    super('inline-components-plugin/counter', 'span', controller);
  }
}
