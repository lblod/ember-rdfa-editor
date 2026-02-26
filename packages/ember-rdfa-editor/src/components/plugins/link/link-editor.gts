import { action } from '@ember/object';
import Component from '@glimmer/component';
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
import AuAlert from '@appuniversum/ember-appuniversum/components/au-alert';
import { tracked } from 'tracked-built-ins';
import { cached } from '@glimmer/tracking';
import type { LinkParser } from '#root/plugins/link/parser.js';
import { defaultLinkParser } from '#root/plugins/link/parser.ts';
import type { PNode } from '#root/prosemirror-aliases.js';

type Args = {
  controller: SayController;
  linkParser: LinkParser;
  link: { pos: number; node: PNode };
  showTitle?: boolean;
};

export default class LinkEditor extends Component<Args> {
  @tracked amountOfInputChanges = 0;

  parseLink: LinkParser = (input?: string) => {
    return this.args.linkParser
      ? this.args.linkParser(input)
      : defaultLinkParser(input);
  };

  @cached
  get linkParserResult() {
    return this.parseLink(this.href);
  }

  get controller() {
    return this.args.controller;
  }

  get link() {
    return this.args.link;
  }

  get href() {
    return this.link.node.attrs['href'] as string | undefined;
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
    const result = this.parseLink(text);
    this.href = result.value ?? text;
  }

  @action
  selectHref(event: FocusEvent) {
    (event.target as HTMLInputElement).select();
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
        {{#if @showTitle}}
          <c.header>
            <AuHeading @level="3" @skin="5">{{t
                "ember-rdfa-editor.link.edit.title"
              }}</AuHeading>
          </c.header>
        {{/if}}
        <c.content class="au-c-content--small">
          <AuInput
            value={{this.href}}
            @width="block"
            {{on "change" this.setHref}}
            {{on "focus" this.selectHref}}
            placeholder={{t "ember-rdfa-editor.link.placeholder.href"}}
          />
          {{#if this.linkParserResult}}
            {{#unless this.linkParserResult.isSuccessful}}
              {{#let this.linkParserResult.errors as |errors|}}
                {{#each errors as |error|}}
                  <AuAlert @size="small" @skin="error" @icon="cross">
                    {{error}}
                  </AuAlert>
                {{/each}}
              {{/let}}
            {{/unless}}
          {{/if}}
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
