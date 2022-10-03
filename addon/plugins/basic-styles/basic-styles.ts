import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import { boldMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/bold';
import { italicMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/italic';
import { strikethroughMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/strikethrough';
import { underlineMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/underline';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';

export default class BasicStyles implements EditorPlugin {
  get name(): string {
    return 'basic-styles';
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async initialize(
    _transaction: Transaction,
    controller: Controller
  ): Promise<void> {
    // TODO: change to transaction.registerMark
    controller.registerMark(boldMarkSpec);
    controller.registerMark(italicMarkSpec);
    controller.registerMark(strikethroughMarkSpec);
    controller.registerMark(underlineMarkSpec);
  }
}
