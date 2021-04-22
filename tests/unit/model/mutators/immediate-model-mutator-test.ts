import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelPosition from "@lblod/ember-rdfa-editor/model/model-position";
import ImmediateModelMutator from "@lblod/ember-rdfa-editor/model/mutators/immediate-model-mutator";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import {setupTest} from "ember-qunit";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";

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
    const mut = new ImmediateModelMutator(ctx.model);
    const resultPos = mut.splitUntil(position, element => element.type === "div");
    assert.true(initial.sameAs(expected));
    assert.true(resultPos.sameAs(ModelPosition.fromPath(initial as ModelElement, [0, 1])));

  });
});
