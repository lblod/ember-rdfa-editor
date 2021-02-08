import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {IndexOutOfRangeError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

module("Unit | model | model-element-test", hooks => {
  const ctx = new ModelTestContext();
  hooks.beforeEach(() => {
    ctx.reset();
  });

  module("Unit | model | model-element-test | isolateChildAt", _hooks => {
    test("throws when index out of range", assert => {
      const div = new ModelElement("div");

      assert.throws(() => div.isolateChildAt(-1), new IndexOutOfRangeError());
      assert.throws(() => div.isolateChildAt(0), new IndexOutOfRangeError());
      assert.throws(() => div.isolateChildAt(1), new IndexOutOfRangeError());

    });

    test("throws when index out of range", assert => {
      const div = new ModelElement("div");
      div.children = [new ModelText("a"), new ModelText("b")];

      assert.throws(() => div.isolateChildAt(-1), new IndexOutOfRangeError());
      assert.throws(() => div.isolateChildAt(2), new IndexOutOfRangeError());

    });

    test("does nothing when only one child", assert => {
      const parent = new ModelElement("div");
      const div = new ModelElement("div");
      const content = new ModelText("test");
      parent.addChild(div);
      div.addChild(content);

      const {left, middle, right} = div.isolateChildAt(0);

      assert.strictEqual(parent.length, 1);
      assert.strictEqual(parent.firstChild, div);

      assert.strictEqual(div.length, 1);
      assert.strictEqual(div.firstChild, content);

      assert.strictEqual(middle, div);
      assert.strictEqual(left, null);
      assert.strictEqual(right, null);

    });
    test("isolates first child", assert => {

      const parent = new ModelElement("div");
      const div = new ModelElement("div");
      const content = new ModelText("test");
      const siblingContent = new ModelText("sibling");
      parent.addChild(div);
      div.addChild(content);
      div.addChild(siblingContent);

      const {left, middle, right} = div.isolateChildAt(0);

      assert.strictEqual(left, null);

      assert.strictEqual(middle, div);
      assert.strictEqual(middle.length, 1);
      assert.strictEqual(middle.firstChild, content);

      assert.strictEqual(right?.length, 1);
      assert.strictEqual(right?.firstChild, siblingContent);
    });

    test("isolates last child", assert => {

      const parent = new ModelElement("div");
      const div = new ModelElement("div");
      const content = new ModelText("test");
      const siblingContent = new ModelText("sibling");
      parent.addChild(div);
      div.addChild(siblingContent);
      div.addChild(content);

      const {left, middle, right} = div.isolateChildAt(1);

      assert.strictEqual(left, div);
      assert.strictEqual(left?.length, 1);
      assert.strictEqual(left?.firstChild, siblingContent);

      assert.strictEqual(middle.length, 1);
      assert.strictEqual(middle.firstChild, content);

      assert.strictEqual(right, null);
    });

    test("isolates middle child", assert => {

      const parent = new ModelElement("div");
      const div = new ModelElement("div");

      const content = new ModelText("test");
      const leftSiblingContent = new ModelText("leftSibling");
      const rightSiblingContent = new ModelText("rightSibling");
      parent.addChild(div);

      div.addChild(leftSiblingContent);
      div.addChild(content);
      div.addChild(rightSiblingContent);

      const {left, middle, right} = div.isolateChildAt(1);

      assert.strictEqual(left?.length, 1);
      assert.strictEqual(left?.firstChild, leftSiblingContent);

      assert.strictEqual(middle.length, 1);
      assert.strictEqual(middle.firstChild, content);

      assert.strictEqual(right?.length, 1);
      assert.strictEqual(right?.firstChild, rightSiblingContent);
    });
  });


});


