import Component from '@glimmer/component';
import { ProseController } from '@lblod/ember-rdfa-editor/core/prosemirror';
import { NodeSelection } from 'prosemirror-state';

type Args = {
  controller: ProseController;
};
export default class LinkEditor extends Component<Args> {
  get controller() {
    return this.args.controller;
  }

  get href() {
    return this.link?.node.attrs.href as string | undefined;
  }

  set href(value: string | undefined) {
    if (this.link) {
      const { pos } = this.link;
      this.controller.withTransaction((tr) => {
        return tr.setNodeAttribute(pos, 'href', value);
      });
    }
  }

  get link() {
    const { selection } = this.controller.state;
    if (
      selection instanceof NodeSelection &&
      selection.node.type === this.controller.schema.nodes.link
    ) {
      return { pos: selection.from, node: selection.node };
    } else {
      return;
    }
  }
}
