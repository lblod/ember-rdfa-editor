import controller from '@lblod/ember-rdfa-editor/model/controller';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import { exampleInlineComponent } from './components/example-inline-component';
import { imageInlineComponent } from './components/image-inline-component';

export default class InlineComponents implements EditorPlugin {
  get name(): string {
    return 'inline-components';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: controller): Promise<void> {
    controller.registerInlineComponent(exampleInlineComponent);
    controller.registerInlineComponent(imageInlineComponent);
  }
}
