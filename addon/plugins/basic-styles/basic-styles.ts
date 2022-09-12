import { EditorPlugin } from '@lblod/ember-rdfa-editor/model/editor-plugin';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import { boldMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/bold';
import { italicMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/italic';
import { strikethroughMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/strikethrough';
import { underlineMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/underline';

export default class BasicStyles implements EditorPlugin {
  get name(): string {
    return 'basic-styles';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(controller: Controller): Promise<void> {
    controller.registerMark(boldMarkSpec);
    controller.registerMark(italicMarkSpec);
    controller.registerMark(strikethroughMarkSpec);
    controller.registerMark(underlineMarkSpec);
  }
}
