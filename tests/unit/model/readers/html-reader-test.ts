import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import HtmlReader from "@lblod/ember-rdfa-editor/model/readers/html-reader";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import {AssertionError} from "@lblod/ember-rdfa-editor/utils/errors";
import ModelText from "@lblod/ember-rdfa-editor/model/model-text";

module("Unit | model | readers | html-reader", hooks => {

  let reader: HtmlReader;
  const ctx = new ModelTestContext();
  hooks.beforeEach(() => {
    ctx.reset();
    reader = new HtmlReader(ctx.model);
  });

  test("read simple tree", assert => {

    const p = document.createElement("p");
    const abc = new Text("abc");
    p.appendChild(abc);

    const result = reader.read(p);
    if (!ModelNode.isModelElement(result)) {
      throw new AssertionError();
    }

    assert.strictEqual(result.type, "p");
    assert.strictEqual((result.children[0] as ModelText).content, "abc");

  });

});
