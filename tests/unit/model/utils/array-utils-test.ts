import {module, test} from "qunit";
import ArrayUtils from "@lblod/ember-rdfa-editor/model/util/array-utils";

module("Unit | utils | array-utils", () => {
  module("Unit | utils | array-utils | findCommonSlice", () => {

    test("returns empty array when both arrays are empty", assert => {
      const a1: number[] = [];
      const a2: number[] = [];
      const rslt = ArrayUtils.findCommonSlice(a1, a2);
      assert.strictEqual(rslt.length, 0);

    });
    test("returns empty array when no items in common", assert => {
      const a1 = [1, 2, 3];
      const a2 = [4, 5, 6];
      const rslt = ArrayUtils.findCommonSlice(a1, a2);
      assert.strictEqual(rslt.length, 0);
    });
    test("returns whole array when identical", assert => {
      const a1 = [1, 2, 3];
      const a2 = [1, 2, 3];
      const rslt = ArrayUtils.findCommonSlice(a1, a2);
      assert.strictEqual(rslt.length, 3);
      assert.deepEqual(rslt, a1);
    });

    test("returns common subslice", assert => {
      const a1 = [1, 2, 4];
      const a2 = [1, 2, 3];
      const rslt = ArrayUtils.findCommonSlice(a1, a2);
      assert.strictEqual(rslt.length, 2);
      assert.deepEqual(rslt, [1, 2]);
    });
  });

});
