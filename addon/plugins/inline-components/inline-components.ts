import controller from '@lblod/ember-rdfa-editor/model/controller';
import { InlineComponentSpec } from '@lblod/ember-rdfa-editor/model/inline-components/model-inline-component';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';

export default class InlineComponents implements EditorPlugin {
  get name(): string {
    return 'inline-components';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: controller): Promise<void> {
    controller.registerInlineComponent(
      new InlineComponentSpec(
        'inline-components/example-inline-component',
        'span'
      )
    );
  }
}
