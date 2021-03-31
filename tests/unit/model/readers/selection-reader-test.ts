import {module, test} from "qunit";
import SelectionReader from "@lblod/ember-rdfa-editor/model/readers/selection-reader";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import {getWindowSelection} from "@lblod/ember-rdfa-editor/utils/dom-helpers";

module("Unit | model | readers | selection-reader", hooks => {
  let reader: SelectionReader;
  let ctx: ModelTestContext;
  hooks.beforeEach(() => {
    ctx = new ModelTestContext();
    ctx.reset();
    reader = new SelectionReader(ctx.model);
  });
  hooks.afterEach(() => {
    ctx.destroy();
  });

  function sync() {
    ctx.model.read();
    ctx.model.write();
  }

  // @ts-ignore
  test.skip("converts a selection correctly", assert => {
    const {model, rootNode} = ctx;
    const domSelection = getWindowSelection();
    const textNode = new Text("asdf");
    rootNode.appendChild(textNode);

    sync();
    domSelection.collapse(rootNode.childNodes[0], 0);
    const rslt = reader.read(getWindowSelection());

    assert.true(rslt.anchor?.sameAs(ModelPosition.fromPath(model.rootModelNode, [0])));
    assert.true(rslt.focus?.sameAs(ModelPosition.fromPath(model.rootModelNode, [0])));

  });

  // @ts-ignore
  test.skip("converts a dom range correctly", assert => {
    const {model, rootNode} = ctx;
    const text = new Text("abc");
    rootNode.appendChild(text);
    sync();
    const testRange = document.createRange();
    testRange.setStart(text, 0);
    testRange.setEnd(text, 0);

    const result = reader.readDomRange(testRange);
    assert.true(result?.collapsed);
    assert.true(result?.start.sameAs(ModelPosition.fromPath(model.rootModelNode, [0])));

  });
  // @ts-ignore
  test.skip("correctly handles a tripleclick selection", assert => {
    const {rootNode, domSelection} = ctx;
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

    sync();
    domSelection.setBaseAndExtent(rootNode.childNodes[0].childNodes[0], 0, rootNode.childNodes[0], 4);
    const result = reader.read(domSelection);

    const range = result.lastRange!;
    assert.deepEqual(range.start.path, [0, 0]);
    assert.deepEqual(range.end.path, [0, 8]);

  });
  module("Unit | model | reader | selection-reader | readDomPosition", () => {

    test("converts a dom position correctly", assert => {
      const {model, rootNode} = ctx;
      const text = new Text("abc");
      rootNode.appendChild(text);
      sync();

      const result = reader.readDomPosition(text, 0);
      assert.true(result?.sameAs(ModelPosition.fromPath(model.rootModelNode, [0])));

    });
    test("converts a dom position correctly before text node", assert => {
      const {model, rootNode} = ctx;
      const text = new Text("abc");
      rootNode.appendChild(text);
      sync();

      const result = reader.readDomPosition(rootNode, 0);
      assert.true(result?.sameAs(ModelPosition.fromPath(model.rootModelNode, [0])));

    });
    test("converts a dom position correctly after text node", assert => {
      const {model, rootNode} = ctx;
      const text = new Text("abc");
      rootNode.appendChild(text);
      sync();

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
      sync();

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
