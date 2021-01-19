import {module, test} from "qunit";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {PositionError} from "@lblod/ember-rdfa-editor/utils/errors";
import {RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";

module("Unit | model | model-position", () => {

  module("Unit | model | model-position | comparePath", () => {


    test("throws when one of paths is empty", assert => {
      const path1: number[] = [];
      const path2 = [0, 3];

      assert.throws(() => {
        ModelPosition.comparePath(path1, path2);
      }, PositionError);
    });

    test("recognizes identical paths", assert => {
      const path1 = [0, 1, 2, 3];
      const path2 = [0, 1, 2, 3];
      assert.strictEqual(ModelPosition.comparePath(path1, path2), RelativePosition.EQUAL);

    });

    test("path1 before path2", assert => {
      let path1 = [0];
      let path2 = [1];
      assert.strictEqual(ModelPosition.comparePath(path1, path2), RelativePosition.BEFORE);

      path1 = [0, 1, 2, 3, 3];
      path2 = [0, 1, 2, 3, 4];
      assert.strictEqual(ModelPosition.comparePath(path1, path2), RelativePosition.BEFORE);
    });

    test("path1 after path2", assert => {
      let path1 = [1];
      let path2 = [0];
      assert.strictEqual(ModelPosition.comparePath(path1, path2), RelativePosition.AFTER);

      path1 = [0, 1, 2, 3, 4];
      path2 = [0, 1, 2, 3, 3];
      assert.strictEqual(ModelPosition.comparePath(path1, path2), RelativePosition.AFTER);
    });
    test("path1 shorter than path2", assert => {
      let path1 = [1];
      let path2 = [1, 1];
      assert.strictEqual(ModelPosition.comparePath(path1, path2), RelativePosition.BEFORE);

      path1 = [0, 1, 2, 3, 4];
      path2 = [0, 1, 2, 3, 4, 1];
      assert.strictEqual(ModelPosition.comparePath(path1, path2), RelativePosition.BEFORE);
    });
    test("path1 longer than path2", assert => {
      let path1 = [1, 1];
      let path2 = [1];
      assert.strictEqual(ModelPosition.comparePath(path1, path2), RelativePosition.AFTER);

      path1 = [0, 1, 2, 3, 4, 1];
      path2 = [0, 1, 2, 3, 4];
      assert.strictEqual(ModelPosition.comparePath(path1, path2), RelativePosition.AFTER);
    });
  });
});

