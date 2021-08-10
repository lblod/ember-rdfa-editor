import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import {IndexOutOfRangeError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelNodeUtils from "@lblod/ember-rdfa-editor/model/util/model-node-utils";

module("Unit | model | model-element-test", hooks => {
  const ctx = new ModelTestContext();
  hooks.beforeEach(() => {
    ctx.reset();
  });

  module("Unit | model | model-element-test | offsetToIndex", () => {
    test("offset 0 should give index 0", assert => {
      const div = new ModelElement("div");
      assert.strictEqual(div.offsetToIndex(0), 0);
    });

    test("offset 0 should give index 0 with children", assert => {
      const div = new ModelElement("div");
      const span = new ModelElement("span");
      const txt = new ModelText("test");
      const span2 = new ModelElement("span");

      div.appendChildren(span, txt, span2);
      assert.strictEqual(div.offsetToIndex(0), 0);
    });

    test("index should be equal to offset, when only element children", assert => {
      const div = new ModelElement("div");
      const span = new ModelElement("span");
      const span2 = new ModelElement("span");
      const span3 = new ModelElement("span");
      const img = new ModelElement("img");

      div.appendChildren(span, span2, span3, img);
      assert.strictEqual(div.offsetToIndex(0), 0);
      assert.strictEqual(div.offsetToIndex(1), 1);
      assert.strictEqual(div.offsetToIndex(2), 2);
      assert.strictEqual(div.offsetToIndex(3), 3);
    });

    test("offset after last child gives index == length", assert => {
      const div = new ModelElement("div");
      const span = new ModelElement("span");
      const span2 = new ModelElement("span");
      const span3 = new ModelElement("span");
      const img = new ModelElement("img");

      div.appendChildren(span, span2, span3, img);
      assert.strictEqual(div.offsetToIndex(4), 4);
    });

    test("single text child", assert => {
      const div = new ModelElement("div");
      const txt = new ModelText("abc");
      div.addChild(txt);

      assert.strictEqual(div.offsetToIndex(0), 0);
      assert.strictEqual(div.offsetToIndex(1), 0);
      assert.strictEqual(div.offsetToIndex(2), 0);
      assert.strictEqual(div.offsetToIndex(3), 1);
    });

    test("elements and text children", assert => {
      const div = new ModelElement("div");
      const span = new ModelElement("span");
      const txt = new ModelText("abc");
      const span2 = new ModelElement("span");
      div.appendChildren(span,txt, span2);

      assert.strictEqual(div.offsetToIndex(0), 0);
      assert.strictEqual(div.offsetToIndex(1), 1);
      assert.strictEqual(div.offsetToIndex(2), 1);
      assert.strictEqual(div.offsetToIndex(3), 1);
      assert.strictEqual(div.offsetToIndex(4), 2);
      assert.strictEqual(div.offsetToIndex(5), 3);
    });
  });

  module("Unit | model | model-element-test | isolateChildAt", () => {
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

  module("Unit | model | model-element-test | rdfa attributes", () => {
    test("getRdfaPrefixes should include vocab", assert => {
      // this is matching marawa expectations, not sure if it's actually a good idea
      const parent = new ModelElement("div");
      parent.setAttribute("vocab", "http://mu.semte.ch/vocabularies/core/");
      assert.true(parent.getRdfaPrefixes().has(""));
      assert.equal(parent.getRdfaPrefixes().get(""), "http://mu.semte.ch/vocabularies/core/" );
    });

    test("addChild propagates the correct prefixes", assert => {
      const parent = new ModelElement("div");
      parent.setAttribute("prefix", "mu: http://mu.semte.ch/vocabularies/core/");
      const child = new ModelElement("div");
      parent.addChild(child);
      assert.equal(child.getRdfaPrefixes().get("mu"), "http://mu.semte.ch/vocabularies/core/");
    });

    test("addChild respects the childs prefixes", assert => {
      const parent = new ModelElement("div");
      parent.setAttribute("prefix", "mu: http://mu.semte.ch/vocabularies/core/");
      const child = new ModelElement("div");
      child.setAttribute("prefix", "mu: http://mu.semte.ch/vocabularies/foo/");
      parent.addChild(child);
      assert.equal(child.getRdfaPrefixes().get("mu"), "http://mu.semte.ch/vocabularies/foo/");
    });

    test("childs should inherit vocab from their parent", assert => {
      const parent = new ModelElement("div");
      parent.setAttribute("vocab", "http://mu.semte.ch/vocabularies/core/");
      const child = new ModelElement("div");
      parent.addChild(child);
      assert.equal(child.getVocab(), "http://mu.semte.ch/vocabularies/core/");
    });
  });

  module("Unit | model | model-element-test | findFirstChild", () => {
    test("finds only text child", assert => {
      // language=XML
      const {root: rootNode, textNodes: {textNode}} = vdom`
        <modelRoot>
          <text __id="textNode">only text</text>
        </modelRoot>
      `;

      const result = (rootNode as ModelElement).findFirstChild(ModelNode.isModelText);
      assert.true(result?.sameAs(textNode));
    });

    test("finds first text child of multiple text children", assert => {
      // language=XML
      const {root: rootNode, textNodes: {textNode}} = vdom`
        <modelRoot>
          <text bold="true" __id="textNode">bold text</text>
          <text>normal text</text>
          <text italic="true">italic text</text>
        </modelRoot>
      `;

      const result = (rootNode as ModelElement).findFirstChild(ModelNode.isModelText);
      assert.true(result?.sameAs(textNode));
    });

    test("returns null when no table found", assert => {
      // language=XML
      const {root: rootNode} = vdom`
        <modelRoot>
          <text>only text here</text>
        </modelRoot>
      `;

      const result = (rootNode as ModelElement).findFirstChild(ModelNodeUtils.isTableContainer);
      assert.true(result === null);
    });
  });
});


