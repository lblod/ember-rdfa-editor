import Component from '@glimmer/component';
import { NodeSelection } from 'prosemirror-state';
import type SayController from '#root/core/say-controller.ts';
import type { LinkParser } from '#root/plugins/link/parser.js';
import { defaultLinkParser } from '#root/plugins/link/parser.ts';
import LinkEditor from './link-editor.gts';

type Args = {
  controller?: SayController;
  linkParser?: LinkParser;
};

export default class LinkSidebarWidget extends Component<Args> {
  get linkParser() {
    return this.args.linkParser ?? defaultLinkParser;
  }

  get controller() {
    return this.args.controller;
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
