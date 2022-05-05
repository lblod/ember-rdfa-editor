import { module, test } from 'qunit';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import UnindentListCommand from '@lblod/ember-rdfa-editor/commands/unindent-list-command';

module('Unit | commands | unindent-list-command-test', function (hooks) {
  let command: UnindentListCommand;
  const ctx = new ModelTestContext();
  hooks.beforeEach(() => {
    ctx.reset();
    command = new UnindentListCommand(ctx.model);
  });

  test('should unindent simple list', function (assert) {
    const {
      modelSelection,
      model: { rootModelNode },
    } = ctx;

    const ul11 = new ModelElement('ul');
    const li11 = new ModelElement('li');
    const li12 = new ModelElement('li');
    const li13 = new ModelElement('li');
    const li14 = new ModelElement('li');

    const ul21 = new ModelElement('ul');
    const li21 = new ModelElement('li');
    const li22 = new ModelElement('li');
    const li23 = new ModelElement('li');
    const li24 = new ModelElement('li');

    const content11 = new ModelText('test');
    const content12 = new ModelText('test');
    const content13 = new ModelText('test');
    const content14 = new ModelText('test');

    const content21 = new ModelText('test');
    const content22 = new ModelText('test');
    const content23 = new ModelText('test');
    const content24 = new ModelText('test');

    rootModelNode.addChild(ul11);

    ul11.addChild(li11);
    li11.addChild(content11);
    ul11.addChild(li12);
    li12.addChild(content12);
    ul11.addChild(li13);
    li13.addChild(content13);
    ul11.addChild(li14);
    li14.addChild(content14);

    ul21.addChild(li21);
    li21.addChild(content21);
    ul21.addChild(li22);
    li22.addChild(content22);
    ul21.addChild(li23);
    li23.addChild(content23);
    ul21.addChild(li24);
    li24.addChild(content24);

    li12.addChild(ul21, 1);

    modelSelection.collapseIn(content21, 2);

    command.execute();

    assert.strictEqual(content21.parent?.parent, ul11);
  });
});
