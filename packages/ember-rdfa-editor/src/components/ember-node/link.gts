import leaveOnEnterKey from '#root/modifiers/leave-on-enter-key.ts';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import type { EmberNodeArgs } from '#root/utils/ember-node.ts';
import { Velcro } from 'ember-velcro';
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
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import type IntlService from 'ember-intl/services/intl';
import { CircleXIcon } from '@appuniversum/ember-appuniversum/components/icons/circle-x';

export default class Link extends Component<EmberNodeArgs> {
  @service declare intl: IntlService;

  get isNewLink() {
    return this.link && (this.link.node.attrs['isNew'] as boolean);
  }

  selectionChangeHandler = (selected: boolean) => {
    if (!selected && this.isNewLink) {
      this.args.updateAttribute('isNew', false, true);
    }
  };

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

  @cached
  get linkParserResult() {
    return this.linkParser(this.href);
  }

  get linkTitle() {
    if (this.linkParserResult.isSuccessful) {
      return this.intl.t('ember-rdfa-editor.link.ctrlClickDescription');
    } else {
      return this.linkParserResult.errors[0];
    }
  }

  get linkIcon() {
    if (this.linkParserResult.isSuccessful || this.isNewLink) {
      return;
    } else {
      return CircleXIcon;
    }
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
    return `say-pill ${this.linkParserResult.isSuccessful || this.isNewLink ? '' : 'say-pill--error'}`;
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
        @icon={{this.linkIcon}}
        title={{this.linkTitle}}
        aria-describedby="link-tooltip"
        {{velcro.hook}}
        {{on "click" this.onClick}}
      >
        <EmbeddedEditor
          @controller={{@controller}}
          @node={{@node}}
          @view={{@view}}
          @getPos={{@getPos}}
          @onSelected={{this.selectionChangeHandler}}
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
