import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import DeleteLiBackwardsCommand from "@lblod/ember-rdfa-editor/commands/delete-li-backwards-command";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | commands | delete-li-backwards-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: DeleteLiBackwardsCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new DeleteLiBackwardsCommand(ctx.model);
  });

  // Can't seem to figure out why the root of lastRange and root of resultRange don't match.
  test("deletes first li (not nested)", assert => {
    // language=XML
    const {root: initial, textNodes: {firstLi}} = vdom`
      <modelRoot>
        <ul>
          <li>
            <text __id="firstLi">first li</text>
          </li>
          <li>
            <text>second li</text>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>first li</text>
        <ul>
          <li>
            <text>second li</text>
          </li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(firstLi, 0, 0);
    const resultRange = ModelRange.fromInNode(initial, 0, 0);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    assert.true(ctx.model.selection.lastRange?.sameAs(resultRange));
  });
});
