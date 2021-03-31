import {module, test} from "qunit";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import {RelativePosition} from "@lblod/ember-rdfa-editor/model/util/types";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | model | model-position", () => {
  module("Unit | model | model-position | getCommonAncestor", () => {
    test("returns null when start and end have different root", assert => {
      const root = new ModelElement("div");
      const root2 = new ModelElement("div");
      const p1 = ModelPosition.fromPath(root, [0]);
      const p2 = ModelPosition.fromPath(root2, [0]);


      assert.strictEqual(p1.getCommonPosition(p2), null);
    });
    test("returns root when start and end are root", assert => {
      const root = new ModelElement("div");
      const p1 = ModelPosition.fromPath(root, []);
      const p2 = ModelPosition.fromPath(root, []);
      assert.true(p1.getCommonPosition(p2)?.sameAs(ModelPosition.fromPath(root, [])));
    });

    test("returns correct common ancestor", assert => {
      const root = new ModelElement("div");
      const common = new ModelElement("span");

      const t1 = new ModelText("abc");
      const t2 = new ModelText("def");
      root.addChild(common);
      common.appendChildren(t1, t2);

      const p1 = ModelPosition.fromInTextNode(t1, 1);
      const p2 = ModelPosition.fromInTextNode(t2, 1);
      assert.strictEqual(p1.getCommonAncestor(p2), common);
    });

  });
  module("Unit | model | model-position | split", () => {
    test("splits text nodes correctly", assert => {

      const root = new ModelElement("div");

      const text = new ModelText("abc");
      root.addChild(text);

      const range = ModelRange.fromPaths(root, [0, 0], [0, 1]);

      range.start.split();
      range.end.split();

      assert.strictEqual(root.length, 2);
      assert.strictEqual((root.children[0] as ModelText).content, "a");
      assert.strictEqual((root.children[1] as ModelText).content, "bc");

    });

    test("splits text nodes correctly with saveEdges", assert => {

      const root = new ModelElement("div");

      const text = new ModelText("abc");
      root.addChild(text);

      const range = ModelRange.fromPaths(root, [0, 0], [0, 1]);

      range.start.split();
      range.end.split();

      assert.strictEqual(root.length, 2);
      assert.strictEqual((root.children[0] as ModelText).content, "a");
      assert.strictEqual((root.children[1] as ModelText).content, "bc");

    });
    test("splits correctly 2 with saveEdges", assert => {
      const root = new ModelElement("p", {debugInfo: "root"});

      const t1 = new ModelText(`a paragraph with Lorem ipsum Itaque consequatur
    maxime repudiandae eos est. Et et officia est dolore eum ipsam laborum recusandae.
    Ab excepturi cum mollitia ut.…`);
      const br1 = new ModelElement("br");
      const t2 = new ModelText(` and a break (or two ?)`);
      const br2 = new ModelElement("br");

      root.appendChildren(t1, br1, t2, br2);

      const range = ModelRange.fromPaths(root, [0, 5], [0, 10]);
      range.start.split();
      range.end.split();


      assert.strictEqual(root.length, 6);
      assert.strictEqual((root.children[0] as ModelText).content, "a par");
      assert.strictEqual((root.children[1] as ModelText).content, "agrap");
      // don't reformat this
      assert.strictEqual((root.children[2] as ModelText).content,
        `h with Lorem ipsum Itaque consequatur
    maxime repudiandae eos est. Et et officia est dolore eum ipsam laborum recusandae.
    Ab excepturi cum mollitia ut.…`);

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

