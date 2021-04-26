import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ImmediateModelMutator from "@lblod/ember-rdfa-editor/model/mutators/immediate-model-mutator";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import {setupTest} from "ember-qunit";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | model | mutators | immediate-model-mutator-test", hooks => {
  const ctx = new ModelTestContext();
  setupTest(hooks);
  hooks.beforeEach(() => {
    ctx.reset();
  });
  test("splitUntil splits until predicate true", assert => {
    // language=XML
    const {root: initial, textNodes: {rangeStart}} = vdom`
      <modelRoot>
        <div>
          <span>
            <span>
              <text __id="rangeStart">abcd</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <span>
            <span>
              <text __id="rangeStart">ab</text>
            </span>
          </span>
          <span>
            <span>
              <text __id="rangeStart">cd</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;
    const position = ModelPosition.fromInTextNode(rangeStart, 2);
    ctx.model.fillRoot(initial);
    const mut = new ImmediateModelMutator();
    const resultPos = mut.splitUntil(position, element => element.type === "div");
    assert.true(initial.sameAs(expected));
    assert.true(resultPos.sameAs(ModelPosition.fromPath(initial as ModelElement, [0, 1])));

  });
  module("Unit | model | mutators | immediate-model-mutator-test | unwrap", () => {
    test("unwrap simple element", assert => {
      // language=XML
      const {root: initial, elements: {wrapper}} = vdom`
        <modelRoot>
          <div __id="wrapper">
            <text>abc</text>
          </div>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <text>abc</text>
        </modelRoot>
      `;

      const mut = new ImmediateModelMutator();
      const resultRange = mut.unwrap(wrapper);
      console.log(initial.toXml());
      assert.true(expected.sameAs(initial));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [0], [3])))

    });

    test("unwrap complex element", assert => {
      // language=XML
      const {root: initial, elements: {wrapper}} = vdom`
        <modelRoot>
          <span>
            <text>stuff</text>
          </span>
          <div>

            <div __id="wrapper">
              <text>abc</text>
              <span>
                <text>hello</text>
                <text>world</text>
              </span>
              <div/>
            </div>
          </div>
        </modelRoot>
      `;

      // language=XML
      const {root: expected} = vdom`
        <modelRoot>
          <span>
            <text>stuff</text>
          </span>
          <div>
            <text>abc</text>
            <span>
              <text>hello</text>
              <text>world</text>
            </span>
            <div/>
          </div>
        </div>
      `;

      const mut = new ImmediateModelMutator();
      const resultRange = mut.unwrap(wrapper);
      console.log(initial.toXml());
      assert.true(expected.sameAs(initial));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(initial as ModelElement, [1, 0], [1, 2])));

    });
  });
});
