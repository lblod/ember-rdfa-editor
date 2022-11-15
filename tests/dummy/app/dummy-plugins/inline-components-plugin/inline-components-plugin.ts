import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import CounterSpec from './inline-component-models/counter';
import DropdownSpec from './inline-component-models/dropdown';

export default class InlineComponentsPlugin implements EditorPlugin {
  controller!: Controller;

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: Controller): Promise<void> {
    this.controller = controller;

    controller.registerWidget({
      componentName: 'inline-components-plugin/rdfa-ic-plugin-insert',
      desiredLocation: 'insertSidebar',
    });
    controller.registerInlineComponent(new CounterSpec(this.controller));
    controller.registerInlineComponent(new DropdownSpec(this.controller));
  }

  get name(): string {
    return 'inline-components';
  }
}
