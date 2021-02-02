import {module, test} from "qunit";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import {ModelError, OutsideRootError} from "@lblod/ember-rdfa-editor/utils/errors";


module("Unit | model | model-node", hooks => {
  const ctx = new ModelTestContext();

  hooks.beforeEach(() => {
    ctx.reset();
  });


  test("indexPath returns empty path when node has no parent", assert => {

    const node = new ModelText("test");
    const rslt = node.getIndexPath();
    assert.deepEqual(rslt, []);

  });

  test("indexPath returns correct path when node has parent", assert => {

    const parent = new ModelElement("div");
    const node = new ModelText("test");
    parent.addChild(node);

    const rslt = node.getIndexPath();
    assert.deepEqual(rslt, [0]);

  });
  test("indexPath returns correct path when complex tree", assert => {

    const root = new ModelElement("div");
    const r0 = new ModelElement("div");
    const r1 = new ModelElement("div");
    root.appendChildren(r0, r1);

    const r10 = new ModelElement("div");
    const r11 = new ModelElement("div");
    const node = new ModelText("test");
    r1.appendChildren(r10, r11, node);

    const rslt = node.getIndexPath();
    assert.deepEqual(rslt, [1, 2]);

  });
  module("Unit | model | model-node | promote", _hooks => {
    test("promote of child of root throws error", assert => {
      const root = ctx.model.rootModelNode;
      const childOfRoot = new ModelText("test");
      root.addChild(childOfRoot);

      assert.throws(() => childOfRoot.promote(), new OutsideRootError());
    });

    test("promote(false) turns node into previoussibling of parent", assert => {
      const root = ctx.model.rootModelNode;
      const div = new ModelElement("div");
      const content = new ModelText("test");
      root.addChild(div);
      div.addChild(content);

      content.promote();
      assert.strictEqual(div.previousSibling, content);

    });

    test("promote returns old parent", assert => {
      const root = ctx.model.rootModelNode;
      const div = new ModelElement("div");
      const content = new ModelText("test");
      root.addChild(div);
      div.addChild(content);

      const result = content.promote();
      assert.strictEqual(result, div);

    });

    test("promote moves node into new parent", assert => {
      const root = ctx.model.rootModelNode;
      const div = new ModelElement("div");
      const content = new ModelText("test");
      root.addChild(div);
      div.addChild(content);

      content.promote();
      assert.strictEqual(root.firstChild, content);
      assert.strictEqual(root.lastChild, div);
      assert.strictEqual(div.length, 0);
      assert.strictEqual(root.length, 2);

    });


    test("promote(true) turns node into nextsibling of parent", assert => {
      const root = ctx.model.rootModelNode;
      const div = new ModelElement("div");
      const content = new ModelText("test");
      root.addChild(div);
      div.addChild(content);

      content.promote(true);
      assert.strictEqual(div.nextSibling, content);

    });

    test("promote(true) returns old parent", assert => {
      const root = ctx.model.rootModelNode;
      const div = new ModelElement("div");
      const content = new ModelText("test");
      root.addChild(div);
      div.addChild(content);

      const result = content.promote(true);
      assert.strictEqual(result, div);

    });

    test("promote(true) moves node into new parent", assert => {
      const root = ctx.model.rootModelNode;
      const div = new ModelElement("div");
      const content = new ModelText("test");
      root.addChild(div);
      div.addChild(content);

      content.promote(true);
      assert.strictEqual(root.lastChild, content);
      assert.strictEqual(root.firstChild, div);
      assert.strictEqual(div.length, 0);
      assert.strictEqual(root.length, 2);

    });
  });
});
