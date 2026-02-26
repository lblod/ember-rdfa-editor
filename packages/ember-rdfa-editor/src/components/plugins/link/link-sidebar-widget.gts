import { action } from '@ember/object';
import Component from '@glimmer/component';
import { NodeSelection } from 'prosemirror-state';
import type SayController from '#root/core/say-controller.ts';
import { tracked } from 'tracked-built-ins';
import { cached } from '@glimmer/tracking';
import type { LinkParser } from '#root/plugins/link/parser.js';
import { defaultLinkParser } from '#root/plugins/link/parser.ts';
import LinkEditor from './link-editor.gts';

type Args = {
  controller?: SayController;
  linkParser?: LinkParser;
};

export default class LinkSidebarWidget extends Component<Args> {
  @tracked amountOfInputChanges = 0;

  parseLink: LinkParser = (input?: string) => {
    return this.args.linkParser
      ? this.args.linkParser(input)
      : defaultLinkParser(input);
  };

  get linkParser() {
    return this.args.linkParser ?? defaultLinkParser;
  }

  @cached
  get linkParserResult() {
    return this.parseLink(this.href);
  }

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
    const result = this.parseLink(text);
    this.href = result.value ?? text;
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
    {{#if this.controller}}
      {{#if this.link}}
        <LinkEditor
          @link={{this.link}}
          @linkParser={{this.linkParser}}
          @controller={{this.controller}}
          @showTitle={{true}}
        />
      {{/if}}
    {{/if}}
  </template>
}
