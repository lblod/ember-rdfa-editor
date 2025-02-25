import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import type { NodeType, SayController } from '@lblod/ember-rdfa-editor';
import Sidebar from '@lblod/ember-rdfa-editor/components/sidebar';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import t from 'ember-intl/helpers/t';

type Signature = {
  Args: {
    controller: SayController;
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
  };
};

export default class SampleEmberNodesSidebar extends Component<Signature> {
  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.controller.schema;
  }

  @action
  insertCard() {
    this.insert(this.schema.nodes['card']);
  }

  @action
  insertCounter() {
    this.insert(this.schema.nodes['counter']);
  }

  @action
  insertDropdown() {
    this.insert(this.schema.nodes['dropdown']);
  }

  insert(type?: NodeType) {
    if (type) {
      this.controller.withTransaction((tr) => {
        return tr.replaceSelectionWith(type.create()).scrollIntoView();
      });
    }
  }
  <template>
    <Sidebar as |sidebar|>
      <sidebar.Collapsible
        @title={{t "ember-rdfa-editor.insert"}}
        @expanded={{@expanded}}
        @onToggle={{@onToggle}}
        as |Item|
      >
        <Item>
          <AuButton
            @icon="add"
            @iconAlignment="left"
            @skin="link"
            {{on "click" this.insertCard}}
          >
            Insert Card
          </AuButton>
        </Item>
        <Item>
          <AuButton
            @icon="add"
            @iconAlignment="left"
            @skin="link"
            {{on "click" this.insertCounter}}
          >
            Insert Counter
          </AuButton>
        </Item>
        <Item>
          <AuButton
            @icon="add"
            @iconAlignment="left"
            @skin="link"
            {{on "click" this.insertDropdown}}
          >
            Insert Dropdown
          </AuButton>
        </Item>
      </sidebar.Collapsible>
    </Sidebar>
  </template>
}
