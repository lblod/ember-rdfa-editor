import { action } from '@ember/object';
import Component from '@glimmer/component';
import { NodeSelection } from 'prosemirror-state';
import { SayController } from '#root';
import { linkToHref } from '#root/utils/_private/string-utils';
import { LinkExternalIcon } from '@appuniversum/ember-appuniversum/components/icons/link-external';
import { LinkBrokenIcon } from '@appuniversum/ember-appuniversum/components/icons/link-broken';

type Args = {
  controller?: SayController;
};
export default class LinkEditor extends Component<Args> {
  LinkExternalIcon = LinkExternalIcon;
  LinkBrokenIcon = LinkBrokenIcon;

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
  selectHref(event: InputEvent) {
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
}
