import { module, test } from 'qunit';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';
import UndoCommand from '@lblod/ember-rdfa-editor/commands/undo-command';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';

module('Unit | commands | undo-command-test', function (hooks) {
  const ctx = new ModelTestContext();
  let command: UndoCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new UndoCommand(ctx.model);
  });

  test('undo deletion of only text in document', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot>
        <text>this is the only text available here</text>
      </modelRoot>
    `;

    const { root: next } = vdom`
      <modelRoot/>
    `;

    ctx.model.fillRoot(initial);
    ctx.model.saveSnapshot();
    ctx.model.fillRoot(next);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(initial));
  });

  test('undo addition of only text in document', function (assert) {
    // language=XML
    const { root: initial } = vdom`
      <modelRoot/>
    `;

    const { root: next } = vdom`
      <modelRoot>
        <text>this is the only text available here</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    ctx.model.saveSnapshot();
    ctx.model.fillRoot(next);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(initial));
  });
});
