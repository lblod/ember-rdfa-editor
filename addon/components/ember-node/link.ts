import { action } from '@ember/object';
import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { Velcro } from 'ember-velcro';

export default class Link extends Component<EmberNodeArgs> {
  Velcro = Velcro;

  get href() {
    return this.args.node.attrs.href as string;
  }

  set href(value: string) {
    this.args.updateAttribute('href', value);
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
    return this.node.attrs.interactive as boolean;
  }

  @action
  selectHref(event: InputEvent) {
    (event.target as HTMLInputElement).select();
  }

  @action
  onClick(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      window.open(this.href);
    }
  }

  @action
  remove() {
    const pos = this.args.getPos();
    if (pos !== undefined) {
      this.controller.withTransaction(
        (tr) => {
          return tr.replaceWith(
            pos,
            pos + this.node.nodeSize,
            this.node.content,
          );
        },
        { view: this.controller.mainEditorView },
      );
    }
  }
}
