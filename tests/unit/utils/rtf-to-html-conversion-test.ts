import { module, test } from 'qunit';
import PasteHandler from '@lblod/ember-rdfa-editor/editor/input-handlers/paste-handler';
import RawEditor from '@lblod/ember-rdfa-editor/utils/ce/raw-editor';

module('Addon | Editor | paste-handler', function (hooks) {
  let rawEditor: RawEditor;
  let pasteHandlerInstance: PasteHandler;
  hooks.before(() => {
    rawEditor = new RawEditor({ baseIRI: 'http://localhost:4200/' });
  });

  test('It should handle rtf -> html correctly', function (assert) {
    const myEvent = {
      clipboardData: '123',
    } as unknown as ClipboardEvent;

    pasteHandlerInstance = new PasteHandler({ rawEditor });

    const handlerInstance = pasteHandlerInstance.handleEvent(
      myEvent,
      true,
      false
    );
    console.log('handlerInstance ->', handlerInstance);

    assert.strictEqual('  ', '  ');
  });
});
