import {module, test} from "qunit";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

module("Unit | model | model-position", () => {
  module("Unit | model | model-position | getCommonAncestor", () => {
    test("returns null when start and end have different root" , assert => {
      const root = new ModelElement("div");
      const root2 = new ModelElement("div");
      const p1 = ModelPosition.from(root, [0]);
      const p2 = ModelPosition.from(root2, [0]);


      assert.strictEqual(p1.getCommonAncestor(p2), null);
    });
    test("returns root when start and end are root" , assert => {
      const root = new ModelElement("div");
      const p1 = ModelPosition.from(root, []);
      const p2 = ModelPosition.from(root, []);
      assert.true(p1.getCommonAncestor(p2)?.sameAs(ModelPosition.from(root, [])));
    });

  });

  module("Unit | model | model-position | comparePath", () => {


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

