import { module, test } from 'qunit';
import ModelText from '@lblod/ember-rdfa-editor/core/model/nodes/model-text';
import { Mark } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import { boldMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/bold';

module('Unit | model | model-text-test', function () {
  module('Unit | model | model-text-test | sameAs', function () {
    test('textnodes with same propertiesare the same', function (assert) {
      const t0 = new ModelText('abc');
      const t1 = new ModelText('abc');
      assert.true(t0.sameAs(t1));
    });
    test('textnodes with different properties are not the same', function (assert) {
      const t0 = new ModelText('abc');
      const t1 = new ModelText('abc');
      t1.addMark(new Mark(boldMarkSpec, {}));
      assert.false(t0.sameAs(t1));
    });
  });
});
