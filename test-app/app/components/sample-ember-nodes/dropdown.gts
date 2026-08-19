import Component from '@glimmer/component';
import AuDropdown from '@appuniversum/ember-appuniversum/components/au-dropdown';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';
import type { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/_private/ember-node';

export default class InlineComponentsPluginDropdown extends Component<EmberNodeArgs> {
  get title() {
    return 'Example Dropdown';
  }

  get articles() {
    return [1, 2, 3, 4, 5, 6, 7].map((i) => `Article ${i}`);
  }

  <template>
    <AuDropdown @title={{this.title}} @alignment="left" role="menu">
      {{#each this.articles as |article|}}
        <AuLinkExternal role="menuitem">{{article}}</AuLinkExternal>
      {{/each}}
    </AuDropdown>
  </template>
}
