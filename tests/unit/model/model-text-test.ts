import { module, test } from 'qunit';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import { boldMarkSpec } from '@lblod/ember-rdfa-editor/model/markSpec';

module('Unit | model | model-text-test', () => {
  module('Unit | model | model-text-test | sameAs', () => {
    test('textnodes with same propertiesare the same', (assert) => {
      const t0 = new ModelText('abc');
      const t1 = new ModelText('abc');
      assert.true(t0.sameAs(t1));
    });
    test('textnodes with different properties are not the same', (assert) => {
      const t0 = new ModelText('abc');
      const t1 = new ModelText('abc');
      t1.addMark(boldMarkSpec, {});
      assert.false(t0.sameAs(t1));
    });
  });
});
