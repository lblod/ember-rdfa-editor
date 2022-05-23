import controller from '@lblod/ember-rdfa-editor/model/controller';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import ExampleInlineComponent from './components/example-inline-component';
import ReglementaireBijlageInlineComponent from './components/reglementaire-bijlage-component';

export default class InlineComponents implements EditorPlugin {
  get name(): string {
    return 'inline-components';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: controller): Promise<void> {
    controller.registerInlineComponent(new ExampleInlineComponent());
    controller.registerInlineComponent(
      new ReglementaireBijlageInlineComponent()
    );
  }
}
