import { module, test } from 'qunit';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { AssertionError } from '@lblod/ember-rdfa-editor/utils/errors';

module('Unit | model | model-selection', function (hooks) {
  const ctx = new ModelTestContext();

  hooks.beforeEach(() => {
    ctx.reset();
  });
  test('collapseOn sets position correctly', function (assert) {
    const { modelSelection, model } = ctx;
    const p = new ModelElement('p');
    const content = new ModelText('test');
    model.rootModelNode.addChild(p);
    p.addChild(content);
    modelSelection.collapseIn(content);
    assert.true(modelSelection.isCollapsed);
    assert.true(
      modelSelection.focus?.sameAs(ModelPosition.fromInNode(content, 0))
    );
  });
});
