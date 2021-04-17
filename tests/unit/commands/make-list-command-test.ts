import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelElement from "@lblod/ember-rdfa-editor/model/model-element";
import MakeListCommand from "@lblod/ember-rdfa-editor/commands/make-list-command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";

module("Unit | commands | make-list-command", hooks => {
  const ctx = new ModelTestContext();
  let command: MakeListCommand;
  hooks.beforeEach(() => {
    ctx.reset();
    command = new MakeListCommand(ctx.model);
  });

  test("adding a list in a document with only a new line", assert => {
    const {modelSelection, model} = ctx;

    // language=XML
    const {root: initial} = vdom`
      <text>${"\n"}</text>
    `;

    // language=XML
    const {root: expected} = vdom`
      <dummy>
        <text>${"\n"}</text>
        <ul>
          <li>
          </li>
        </ul>
      </dummy>
    `;

    model.rootModelNode.addChild(initial);

    const range = ModelRange.fromPaths(model.rootModelNode, [1], [1]);
    modelSelection.selectRange(range);
    command.execute("ul");

    for(const [index, childNode] of model.rootModelNode.children.entries()) {
      assert.true(childNode.sameAs((expected as ModelElement).children[index]));
    }
  });
});
