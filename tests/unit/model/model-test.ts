import { module, test } from 'qunit';
import Model from '@lblod/ember-rdfa-editor/model/model';

module('Unit | model | model', function () {
  test('getChildIndex returns index of child - only child', function (assert) {
    const parent = document.createElement('div');
    const searchTarget = document.createElement('span');

    parent.appendChild(searchTarget);

    assert.strictEqual(Model.getChildIndex(searchTarget), 0);
  });

  test('getChildIndex returns index of child - last child', function (assert) {
    const parent = document.createElement('div');
    const searchTarget = document.createElement('span');

    for (let i = 0; i < 4; i++) {
      parent.appendChild(document.createElement('span'));
    }

    parent.appendChild(searchTarget);

    assert.strictEqual(Model.getChildIndex(searchTarget), 4);
  });

  test('getChildIndex returns null if no parent', function (assert) {
    const searchTarget = document.createElement('span');
    assert.strictEqual(Model.getChildIndex(searchTarget), null);
  });
});
