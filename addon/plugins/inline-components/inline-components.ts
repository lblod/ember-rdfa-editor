import controller from '@lblod/ember-rdfa-editor/model/controller';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import CounterSpec from './specs/counter';
import ExampleSpec from './specs/example';
import RegulatoryAttachmentSpec from './specs/regulatory-attachment';

export default class InlineComponents implements EditorPlugin {
  get name(): string {
    return 'inline-components';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: controller): Promise<void> {
    controller.registerInlineComponent(new ExampleSpec());
    controller.registerInlineComponent(new RegulatoryAttachmentSpec());
    controller.registerInlineComponent(new CounterSpec());
  }
}
