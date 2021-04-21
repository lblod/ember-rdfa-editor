import {module, test} from "qunit";
import SelectionReader from "@lblod/ember-rdfa-editor/model/readers/selection-reader";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelTestContext from "dummy/tests/utilities/model-test-context";

module("Unit | model | readers | selection-reader", hooks => {
  let reader: SelectionReader;
  let ctx: ModelTestContext;
  hooks.beforeEach(() => {
    ctx = new ModelTestContext();
    ctx.reset();
    reader = new SelectionReader(ctx.model);
  });

  test("converts a dom range correctly", assert => {
    const {model, rootNode} = ctx;
    const text = new Text("abc");
    rootNode.appendChild(text);
    ctx.model.read(false);
    const testRange = document.createRange();
    testRange.setStart(text, 0);
    testRange.setEnd(text, 0);

    const result = reader.readDomRange(testRange);
    assert.true(result?.collapsed);
    assert.true(result?.start.sameAs(ModelPosition.fromPath(model.rootModelNode, [0])));

  });
  test("correctly handles a tripleclick selection", assert => {
    const {rootNode} = ctx;
    const paragraph = document.createElement("p");
    const t1 = new Text("abc");
    const br1 = document.createElement("br");
    const t2 = new Text("def");
    const br2 = document.createElement("br");
    paragraph.append(t1, br1, t2, br2);

    const psibling = document.createElement("div");
    const t3 = new Text("i should not be selected");
    psibling.appendChild(t3);

    rootNode.append(paragraph, psibling);
    ctx.model.read(false);

    const range = document.createRange();
    range.setStart(rootNode.childNodes[0].childNodes[0], 0);
    range.setEnd(rootNode.childNodes[0], 4);
    const modelRange = reader.readDomRange(range);
    assert.deepEqual(modelRange?.start.path, [0, 0]);
    assert.deepEqual(modelRange?.end.path, [0, 8]);

  });
  module("Unit | model | reader | selection-reader | readDomPosition", () => {

    test("converts a dom position correctly", assert => {
      const {model, rootNode} = ctx;
      const text = new Text("abc");
      rootNode.appendChild(text);
      ctx.model.read(false);

      const result = reader.readDomPosition(text, 0);
      assert.true(result?.sameAs(ModelPosition.fromPath(model.rootModelNode, [0])));

    });
    test("converts a dom position correctly before text node", assert => {
      const {model, rootNode} = ctx;
      const text = new Text("abc");
      rootNode.appendChild(text);
      ctx.model.read(false);

      const result = reader.readDomPosition(rootNode, 0);
      assert.true(result?.sameAs(ModelPosition.fromPath(model.rootModelNode, [0])));

    });
    test("converts a dom position correctly after text node", assert => {
      const {model, rootNode} = ctx;
      const text = new Text("abc");
      rootNode.appendChild(text);
      ctx.model.read(false);

      const result = reader.readDomPosition(rootNode, 1);
      assert.true(result?.sameAs(ModelPosition.fromPath(model.rootModelNode, [3])));

    });


    test("converts a dom position correctly when before element", assert => {
      const {model, rootNode} = ctx;
      const child0 = document.createElement("div");
      const child1 = document.createElement("div");
      const child2 = document.createElement("div");
      rootNode.append(child0, child1, child2);

      const child10 = document.createElement("div");
      const child11 = document.createElement("div");
      const child12 = new Text("abc");
      const child13 = document.createElement("div");
      child1.append(child10, child11, child12, child13);
      ctx.model.read(false);

      let result = reader.readDomPosition(child1, 0);
      assert.true(result?.sameAs(ModelPosition.fromPath(model.rootModelNode, [1, 0])));

      result = reader.readDomPosition(child1, 0);
      assert.true(result?.sameAs(ModelPosition.fromPath(model.rootModelNode, [1, 0])));

      result = reader.readDomPosition(child1, 1);
      assert.true(result?.sameAs(ModelPosition.fromPath(model.rootModelNode, [1, 1])));


      result = reader.readDomPosition(child12, 3);
      assert.true(result?.sameAs(ModelPosition.fromPath(model.rootModelNode, [1, 5])));
    });
  });
});
