import { action } from '@ember/object';
import Component from '@glimmer/component';
import { wrapSelection } from '#root/commands/wrap-selection.ts';
import { LinkIcon } from '@appuniversum/ember-appuniversum/components/icons/link';
import type SayController from '#root/core/say-controller.ts';
import ToolbarButton from '#root/components/toolbar/button.gts';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { not } from 'ember-truth-helpers';
import {
  defaultLinkParser,
  type LinkParser,
} from '#root/plugins/link/parser.ts';

type Args = {
  controller: SayController;
  onActivate?: () => void;
  linkParser?: LinkParser;
};
export default class LinkMenu extends Component<Args> {
  LinkIcon = LinkIcon;

  get controller() {
    return this.args.controller;
  }

  parseLink: LinkParser = (input?: string) => {
    return this.args.linkParser
      ? this.args.linkParser(input)
      : defaultLinkParser(input);
  };

  get schema() {
    return this.controller.schema;
  }

  get canInsert() {
    return (
      !this.controller.inEmbeddedView &&
      this.controller.checkCommand(wrapSelection(this.schema.nodes['link']))
    );
  }

  @action
  insert() {
    if (!this.controller.inEmbeddedView) {
      this.controller.doCommand(
        wrapSelection(this.schema.nodes['link'], (nodeRange) => {
          if (nodeRange) {
            const text = nodeRange.$from.doc.textBetween(
              nodeRange.$from.pos,
              nodeRange.$to.pos,
            );
            const linkParserResult = this.parseLink(text);
            return { href: linkParserResult.value ?? text };
          } else {
            return null;
          }
        }),
      );
      this.controller.focus();
      this.args.onActivate?.();
    }
  }

  <template>
    {{#if @controller}}
      <ToolbarButton
        @title={{t "ember-rdfa-editor.link.insert"}}
        @icon={{this.LinkIcon}}
        {{on "click" this.insert}}
        @disabled={{not this.canInsert}}
      />
    {{/if}}
  </template>
}
