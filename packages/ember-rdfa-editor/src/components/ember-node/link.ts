import { action } from '@ember/object';
import Component from '@glimmer/component';
import type { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node.ts';
import { linkToHref } from '@lblod/ember-rdfa-editor/utils/_private/string-utils.ts';
import { Velcro } from 'ember-velcro';
import { LinkExternalIcon } from '@appuniversum/ember-appuniversum/components/icons/link-external';
import { LinkBrokenIcon } from '@appuniversum/ember-appuniversum/components/icons/link-broken';
import getClassnamesFromNode from '@lblod/ember-rdfa-editor/utils/get-classnames-from-node.ts';
import type { EditorState } from 'prosemirror-state';

export default class Link extends Component<EmberNodeArgs> {
  Velcro = Velcro;
  LinkExternalIcon = LinkExternalIcon;
  LinkBrokenIcon = LinkBrokenIcon;

  get href() {
    return this.args.node.attrs['href'] as string;
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
    return this.node.attrs['interactive'] as boolean;
  }

  get class() {
    return getClassnamesFromNode(this.node);
  }

  @action
  onSelectEmbedded(selected: boolean, innerState: EditorState) {
    if (!selected && !this.href) {
      const href = linkToHref(innerState.doc.textContent);
      if (href) {
        this.href = href;
      }
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
