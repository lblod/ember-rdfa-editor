import { action } from '@ember/object';
import Component from '@glimmer/component';
import type { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';
import { linkToHref } from '@lblod/ember-rdfa-editor/utils/_private/string-utils';
import { Velcro } from 'ember-velcro';
import { EditorState } from '@lblod/ember-rdfa-editor';
import { LinkIcon } from '@appuniversum/ember-appuniversum/components/icons/link';
import { LinkExternalIcon } from '@appuniversum/ember-appuniversum/components/icons/link-external';
import { LinkBrokenIcon } from '@appuniversum/ember-appuniversum/components/icons/link-broken';

export default class Link extends Component<EmberNodeArgs> {
  Velcro = Velcro;
  LinkIcon = LinkIcon;
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
