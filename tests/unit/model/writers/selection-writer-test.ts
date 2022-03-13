import { module, test } from 'qunit';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';
import SelectionWriter from '@lblod/ember-rdfa-editor/model/writers/selection-writer';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';

module('Unit | model | writers | selection-writer', (hooks) => {
  const ctx = new ModelTestContext();

  hooks.beforeEach(() => {
    ctx.reset();
  });
  test('converts a modelSelection correctly', (assert) => {
    const { model } = ctx;
    const text = new ModelText('asdf');
    model.rootModelNode.addChild(text);
    assert.strictEqual(text.length, 4);

    const start = ModelPosition.fromInTextNode(text, 0);
    const end = ModelPosition.fromInTextNode(text, 4);
    model.selection.selectRange(new ModelRange(start, end));

    model.write();
    const writer = new SelectionWriter();
    const domRange = writer.writeDomRange(model.selection.lastRange!);

    assert.strictEqual(domRange.startContainer, text.viewRoot);
    assert.strictEqual(domRange.startOffset, 0);
    assert.strictEqual(domRange.endContainer, model.rootNode);
    assert.strictEqual(domRange.endOffset, 1);
  });
});
