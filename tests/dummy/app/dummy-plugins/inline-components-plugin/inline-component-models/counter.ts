import Controller from '@lblod/ember-rdfa-editor/model/controller';
import {
  InlineComponentSpec,
  Properties,
} from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
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

  properties = {
    count: { serializable: true, defaultValue: 0 },
  };

  _renderStatic(props: Properties) {
    const count = props.count?.toString() || this.properties.count.defaultValue;
    return `
      <p>${count}</p>
    `;
  }
  constructor(controller: Controller) {
    super('inline-components-plugin/counter', 'span', controller);
  }
}
