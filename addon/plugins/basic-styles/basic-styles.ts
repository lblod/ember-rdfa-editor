import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
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
  async initialize(transaction: Transaction): Promise<void> {
    // TODO: change to transaction.registerMark
    transaction.registerMark(boldMarkSpec);
    transaction.registerMark(italicMarkSpec);
    transaction.registerMark(strikethroughMarkSpec);
    transaction.registerMark(underlineMarkSpec);
  }
}
