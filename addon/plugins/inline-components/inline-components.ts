import controller from '@lblod/ember-rdfa-editor/model/controller';
import { InlineComponent } from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';

export default class InlineComponents implements EditorPlugin {
  get name(): string {
    return 'inline-components';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: controller): Promise<void> {
    controller.registerInlineComponent(
      new InlineComponent('inline-components/example-inline-component', 'div')
    );
  }
}
