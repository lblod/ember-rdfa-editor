import {module, test} from "qunit";
import HtmlElementReader from "@lblod/ember-rdfa-editor/model/readers/html-element-reader";
import ModelNode from "@lblod/ember-rdfa-editor/model/model-node";
import ModelTestContext from "dummy/tests/utilities/model-test-context";

module("Unit | model | readers | html-element-reader", hooks => {

  const ctx = new ModelTestContext();


  test("reading an html element gives a model element", assert => {
    const paragraph = document.createElement("p");
    const reader = new HtmlElementReader(ctx.model);

    const result = reader.read(paragraph);
    assert.true(ModelNode.isModelElement(result));
    assert.strictEqual(result.type, "p");
    for (const [key, value] of result.attributeMap.entries()) {
      assert.strictEqual(value, paragraph.getAttribute(key));
    }
  });


});
