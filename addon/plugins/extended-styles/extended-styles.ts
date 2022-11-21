import { EditorPlugin } from '@lblod/ember-rdfa-editor/utils/editor-plugin';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import { subscriptMarkSpec } from '@lblod/ember-rdfa-editor/plugins/extended-styles/marks/subscript';
import { superscriptMarkSpec } from '@lblod/ember-rdfa-editor/plugins/extended-styles/marks/superscript';

export default class ExtendedStyles implements EditorPlugin {
  get name(): string {
    return 'extended-styles';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: Controller): Promise<void> {
    controller.registerWidget({
      componentName: 'subscript-button',
      desiredLocation: 'toolbar',
    });

    controller.registerMark(subscriptMarkSpec);

    controller.registerWidget({
      componentName: 'superscript-button',
      desiredLocation: 'toolbar',
    });

    controller.registerMark(superscriptMarkSpec);
  }
}
