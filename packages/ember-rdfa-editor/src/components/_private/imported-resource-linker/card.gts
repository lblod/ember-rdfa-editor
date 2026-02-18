import Component from '@glimmer/component';
import type { ResolvedPNode } from '#root/utils/_private/types.ts';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import { localCopy } from 'tracked-toolbox';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import AuList from '@appuniversum/ember-appuniversum/components/au-list';
import AuDropdown from '@appuniversum/ember-appuniversum/components/au-dropdown';
import { ChevronDownIcon } from '@appuniversum/ember-appuniversum/components/icons/chevron-down';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import { PencilIcon } from '@appuniversum/ember-appuniversum/components/icons/pencil';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import type SayController from '#root/core/say-controller.ts';
import { getSubjects } from '#root/plugins/rdfa-info/utils.ts';

type Signature = {
  Args: {
    node: ResolvedPNode;
    controller: SayController;
    expanded?: boolean;
    onToggle?: (expanded: boolean) => void;
  };
};

export default class ImportedResourceLinkerCard extends Component<Signature> {
  @localCopy('args.expanded', true) declare expanded: boolean;

  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node.value;
  }

  toggleSection = () => {
    this.expanded = !this.expanded;
    this.args.onToggle?.(this.expanded);
  };

  get allResources(): string[] {
    if (!this.controller) {
      return [];
    }
    return getSubjects(this.controller.mainEditorState);
  }

  get importedResources(): Record<string, string | undefined> | undefined {
    return this.node.attrs['importedResources'] as
      | Record<string, string | undefined>
      | undefined;
  }

  linkImportedResource = (imported: string, linked: string) => {
    const newImported = {
      ...this.importedResources,
      [imported]: linked,
    };
    this.controller?.withTransaction((tr) =>
      tr.setNodeAttribute(this.args.node.pos, 'importedResources', newImported),
    );
  };

  <template>
    {{#if this.importedResources}}
      <AuCard
        @size="small"
        @expandable={{true}}
        @manualControl={{true}}
        @openSection={{this.toggleSection}}
        @isExpanded={{this.expanded}}
        @disableAuContent={{true}}
        as |c|
      >
        <c.header>
          <AuHeading @level="1" @skin="6">Imported resource linker</AuHeading>
        </c.header>
        <c.content class="au-c-content--small">
          <AuList @divider={{true}} as |Item|>
            {{#each-in this.importedResources as |imported linked|}}
              <Item
                class="au-u-flex au-u-flex--row au-u-flex--between au-u-flex--vertical-center"
              >
                {{imported}}
                <AuDropdown
                  @icon={{if linked ChevronDownIcon PlusIcon}}
                  @title={{linked}}
                  role="menu"
                  @alignment="left"
                >
                  {{#each this.allResources as |res|}}
                    <AuButton
                      @skin="link"
                      @icon={{PencilIcon}}
                      role="menuitem"
                      {{on "click" (fn this.linkImportedResource imported res)}}
                    >
                      {{res}}
                    </AuButton>
                  {{/each}}
                </AuDropdown>
              </Item>
            {{/each-in}}
          </AuList>
        </c.content>
      </AuCard>
    {{/if}}
  </template>
}
