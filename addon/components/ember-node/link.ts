import { action } from '@ember/object';
import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';

export default class Link extends Component<EmberNodeArgs> {
  get href() {
    return this.args.node.attrs.href as string;
  }

  set href(value: string) {
    this.args.updateAttribute('href', value);
  }

  @action
  selectHref(event: InputEvent) {
    (event.target as HTMLInputElement).select();
  }

  @action
  onClick(event: KeyboardEvent) {
    if (event.ctrlKey) {
      window.open(this.href);
    }
  }

  get tooltipOpen() {
    return this.args.selected;
  }

  @action
  remove() {
    this.args.controller.withTransaction((tr) => {
      return tr.insertText(
        this.href,
        this.args.getPos(),
        this.args.getPos() + this.args.node.nodeSize
      );
    });
  }
}
