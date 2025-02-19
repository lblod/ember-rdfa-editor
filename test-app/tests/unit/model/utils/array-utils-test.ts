import { module, test } from 'qunit';
import ArrayUtils from '@lblod/ember-rdfa-editor/utils/_private/array-utils';

module('Unit | utils | array-utils', function () {
  module('Unit | utils | array-utils | findCommonSlice', function () {
    test('returns empty array when both arrays are empty', function (assert) {
      const a1: number[] = [];
      const a2: number[] = [];
      const rslt = ArrayUtils.findCommonSlice(a1, a2);
      assert.strictEqual(rslt.length, 0);
    });
    test('returns empty array when no items in common', function (assert) {
      const a1 = [1, 2, 3];
      const a2 = [4, 5, 6];
      const rslt = ArrayUtils.findCommonSlice(a1, a2);
      assert.strictEqual(rslt.length, 0);
    });
    test('returns whole array when identical', function (assert) {
      const a1 = [1, 2, 3];
      const a2 = [1, 2, 3];
      const rslt = ArrayUtils.findCommonSlice(a1, a2);
      assert.strictEqual(rslt.length, 3);
      assert.deepEqual(rslt, a1);
    });

    test('returns common subslice', function (assert) {
      const a1 = [1, 2, 4];
      const a2 = [1, 2, 3];
      const rslt = ArrayUtils.findCommonSlice(a1, a2);
      assert.strictEqual(rslt.length, 2);
      assert.deepEqual(rslt, [1, 2]);
    });
  });
});
