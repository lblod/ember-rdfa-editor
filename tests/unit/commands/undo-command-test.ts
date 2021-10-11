import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import {vdom} from "@lblod/ember-rdfa-editor/util/xml-utils";
import {CORE_OWNER} from "@lblod/ember-rdfa-editor/util/constants";
import UndoCommand from "history-plugin/commands/undo-command";

module("Unit | commands | undo-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: UndoCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new UndoCommand(ctx.model);
  });

  test("undo deletion of only text in document", assert => {
    // language=XML
    const {root: initial} = vdom`
      <modelRoot>
        <text>this is the only text available here</text>
      </modelRoot>
    `;

    const {root: next} = vdom`
      <modelRoot/>
    `;

    ctx.model.fillRoot(initial);
    ctx.model.saveSnapshot();
    ctx.model.fillRoot(next);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(initial));
  });

  test("undo addition of only text in document", assert => {
    // language=XML
    const {root: initial} = vdom`
      <modelRoot/>
    `;

    const {root: next} = vdom`
      <modelRoot>
        <text>this is the only text available here</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    ctx.model.saveSnapshot();
    ctx.model.fillRoot(next);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(initial));
  });
});
