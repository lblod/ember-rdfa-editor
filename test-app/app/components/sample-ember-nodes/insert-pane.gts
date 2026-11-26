import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import type { NodeType, SayController } from '@lblod/ember-rdfa-editor';

type Signature = {
  Args: {
    controller: SayController;
  };
};

export default class SampleEmberNodesInsertPane extends Component<Signature> {
  get schema() {
    return this.args.controller.schema;
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

  private insert(type?: NodeType) {
    if (type) {
      this.args.controller.withTransaction((tr) => {
        return tr.replaceSelectionWith(type.createAndFill()!).scrollIntoView();
      });
    }
  }

  <template>
    <div class="au-u-flex au-u-flex--column au-u-flex--spaced-small">
      <AuButton
        @icon="add"
        @iconAlignment="left"
        @skin="link"
        {{on "click" this.insertCard}}
      >
        Insert Card
      </AuButton>
      <AuButton
        @icon="add"
        @iconAlignment="left"
        @skin="link"
        {{on "click" this.insertCounter}}
      >
        Insert Counter
      </AuButton>
      <AuButton
        @icon="add"
        @iconAlignment="left"
        @skin="link"
        {{on "click" this.insertDropdown}}
      >
        Insert Dropdown
      </AuButton>
    </div>
  </template>
}
