import leaveOnEnterKey from '#root/modifiers/leave-on-enter-key.ts';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import type { EmberNodeArgs } from '#root/utils/ember-node.ts';
import { linkToHref } from '#root/utils/_private/string-utils.ts';
import { Velcro } from 'ember-velcro';
import getClassnamesFromNode from '#root/utils/get-classnames-from-node.ts';
import { hash } from '@ember/helper';
import EmbeddedEditor from './embedded-editor.gts';
import { and } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import Pill from '#root/components/pill.gts';
import LinkEditor from '../plugins/link/link-editor.gts';
import {
  defaultLinkParser,
  type LinkParser,
} from '#root/plugins/link/parser.ts';

export default class Link extends Component<EmberNodeArgs> {
  get href() {
    return this.args.node.attrs['href'] as string;
  }

  get link() {
    const pos = this.args.getPos();
    if (!pos) {
      return;
    }
    return {
      node: this.args.node,
      pos,
    };
  }

  get linkParser() {
    return (
      (this.node.attrs['linkParser'] as LinkParser | null) ??
      defaultLinkParser()
    );
  }

  get controller() {
    return this.args.controller;
  }

  get node() {
    return this.args.node;
  }

  get selected() {
    return this.args.selected;
  }

  get interactive() {
    return this.node.attrs['interactive'] as boolean;
  }

  get class() {
    return getClassnamesFromNode(this.node);
  }


  @action
  onClick(event: PointerEvent) {
    if (event.ctrlKey || event.metaKey) {
      window.open(this.href);
    }
  }

  <template>
    <Velcro
      @placement="bottom-start"
      @offsetOptions={{hash mainAxis=3}}
      @strategy="fixed"
      as |velcro|
    >
      <Pill
        class={{this.class}}
        @skin="link"
        title={{t "ember-rdfa-editor.link.ctrlClickDescription"}}
        aria-describedby="link-tooltip"
        {{velcro.hook}}
        {{on "click" this.onClick}}
      >
        <EmbeddedEditor
          @controller={{@controller}}
          @node={{@node}}
          @view={{@view}}
          @getPos={{@getPos}}
          @selected={{@selected}}
          @placeholder={{t "ember-rdfa-editor.link.placeholder.text"}}
          @contentDecorations={{@contentDecorations}}
          @updateAttribute={{@updateAttribute}}
          @selectNode={{@selectNode}}
          {{leaveOnEnterKey @controller @getPos}}
        />
      </Pill>
      {{#if (and this.selected this.interactive)}}
        {{#if this.link}}
          <LinkEditor
            @controller={{@controller}}
            @link={{this.link}}
            @linkParser={{this.linkParser}}
            {{velcro.loop}}
          />
        {{/if}}
      {{/if}}
    </Velcro>
  </template>
}
