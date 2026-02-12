import { action } from '@ember/object';
import Component from '@glimmer/component';
import { NodeSelection } from 'prosemirror-state';
import { linkToHref } from '#root/utils/_private/string-utils.ts';
import { LinkExternalIcon } from '@appuniversum/ember-appuniversum/components/icons/link-external';
import { LinkBrokenIcon } from '@appuniversum/ember-appuniversum/components/icons/link-broken';
import type SayController from '#root/core/say-controller.ts';
import AuCard from '@appuniversum/ember-appuniversum/components/au-card';
import AuHeading from '@appuniversum/ember-appuniversum/components/au-heading';
import AuButton from '@appuniversum/ember-appuniversum/components/au-button';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import AuInput from '@appuniversum/ember-appuniversum/components/au-input';
import AuLinkExternal from '@appuniversum/ember-appuniversum/components/au-link-external';

type Args = {
  controller?: SayController;
};
export default class LinkEditor extends Component<Args> {

  get controller() {
    return this.args.controller;
  }

  get href() {
    return this.link?.node.attrs['href'] as string | undefined;
  }

  set href(value: string | undefined) {
    if (this.link && this.controller) {
      const { pos } = this.link;
      this.controller.withTransaction(
        (tr) => tr.setNodeAttribute(pos, 'href', value),
        // After reload the default (activeEditorView) is just the link text, so use the main view
        { view: this.controller.mainEditorView },
      );
    }
  }

  @action
  setHref(event: InputEvent) {
    const text = (event.target as HTMLInputElement).value;
    const href = linkToHref(text);
    this.href = href || text;
  }

  @action
  selectHref(event: FocusEvent) {
    (event.target as HTMLInputElement).select();
  }

  get link() {
    if (this.controller) {
      const { selection } = this.controller.mainEditorState;
      if (
        selection instanceof NodeSelection &&
        selection.node.type === this.controller.schema.nodes['link']
      ) {
        return { pos: selection.from, node: selection.node };
      }
    }
    return;
  }

  @action
  remove() {
    if (this.controller && this.link) {
      const { pos, node } = this.link;
      this.controller.withTransaction(
        (tr) => {
          return tr.replaceWith(pos, pos + node.nodeSize, node.content);
        },
        { view: this.controller.mainEditorView },
      );
    }
  }

  <template>
    {{#if this.link}}
      <AuCard
        @flex={{true}}
        @expandable={{false}}
        @shadow={{true}}
        @size="small"
        @disableAuContent={{true}}
        as |c|
      >
        <c.header>
          <AuHeading @level="3" @skin="5">{{t
              "ember-rdfa-editor.link.edit.title"
            }}</AuHeading>
        </c.header>
        <c.content class="au-c-content--small">
          <AuInput
            value={{this.href}}
            @width="block"
            {{on "change" this.setHref}}
            {{on "focus" this.selectHref}}
            placeholder={{t "ember-rdfa-editor.link.placeholder.href"}}
          />
        </c.content>
        <c.footer>
          <AuLinkExternal
            @icon={{LinkExternalIcon}}
            @skin="button-secondary"
            href={{this.href}}
          >{{t "ember-rdfa-editor.link.open"}}</AuLinkExternal>
          <AuButton
            @icon={{LinkBrokenIcon}}
            @alert={{true}}
            @skin="secondary"
            {{on "click" this.remove}}
          >{{t "ember-rdfa-editor.link.edit.uncouple"}}</AuButton>
        </c.footer>
      </AuCard>
    {{/if}}
  </template>
}
