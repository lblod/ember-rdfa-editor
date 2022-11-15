import Controller from '@lblod/ember-rdfa-editor/model/controller';
import { InlineComponentSpec } from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { isElement } from '@lblod/ember-rdfa-editor/utils/dom-helpers';

export default class DropdownSpec extends InlineComponentSpec {
  matcher = {
    tag: this.tag,
    attributeBuilder: (node: Node) => {
      if (isElement(node)) {
        if (node.dataset.inlineComponent === this.name) {
          return {};
        }
      }
      return null;
    },
  };
  properties = {};

  _renderStatic() {
    return `
      <p>Dropdown</p>
    `;
  }
  constructor(controller: Controller) {
    super('inline-components-plugin/dropdown', 'span', controller);
  }
}
