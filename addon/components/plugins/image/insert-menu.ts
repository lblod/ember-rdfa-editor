import { action } from '@ember/object';
import Component from '@glimmer/component';
import { SayController } from '@lblod/ember-rdfa-editor';
import { paintCycleHappened } from '@lblod/ember-rdfa-editor/utils/_private/editor-utils';
import { tracked } from 'tracked-built-ins';

const DEFAULT_SVG_HEIGHT = 100;

type Args = {
  controller: SayController;
  defaultSvgHeight?: number;
};

export default class ImageInsertMenu extends Component<Args> {
  @tracked modalOpen = false;
  @tracked url = '';
  @tracked altText = '';

  get controller() {
    return this.args.controller;
  }

  get schema() {
    return this.args.controller.schema;
  }

  get defaultHeight() {
    if (this.url.trim().toLowerCase().endsWith('svg')) {
      return this.args.defaultSvgHeight ?? DEFAULT_SVG_HEIGHT;
    }

    return undefined;
  }

  @action
  resetValues() {
    this.url = '';
    this.altText = '';
  }

  @action
  showModal() {
    this.modalOpen = true;
  }

  @action
  async closeModal() {
    this.modalOpen = false;
    await paintCycleHappened();
    this.controller.focus();
  }

  @action
  async onCancel() {
    this.resetValues();
    await this.closeModal();
  }

  @action
  async onInsert() {
    const { image } = this.schema.nodes;
    this.controller.withTransaction((tr) => {
      return tr.replaceSelectionWith(
        image.create({
          src: this.url,
          alt: this.altText,
          height: this.defaultHeight,
        })
      );
    });
    this.resetValues();
    await this.closeModal();
  }
}
