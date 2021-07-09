import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import RemoveTableRowCommand from "@lblod/ember-rdfa-editor/commands/remove-table-row-command";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | commands | remove-table-row-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: RemoveTableRowCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new RemoveTableRowCommand(ctx.model);
  });

  test("removes only row", assert => {
    // language=XML
    const {root: initial, textNodes: {topLeft}} = vdom`
      <modelRoot>
        <table>
          <tr>
            <td>
              <text __id="topLeft">abcd</text>
            </td>
            <td>
              <text>efgh</text>
            </td>
          </tr>
        </table>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot></modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(topLeft, 1, 3);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
});
