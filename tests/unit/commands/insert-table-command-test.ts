import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import InsertTableCommand from "@lblod/ember-rdfa-editor/commands/insert-table-command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | commands | insert-table-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: InsertTableCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new InsertTableCommand(ctx.model);
  });

  test("inserts correctly in empty document", assert => {
    const {root: initial} = vdom`
      <modelRoot\>
    `;

    const {root: expected} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(ctx.model.rootModelNode, 0, 0);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts correctly before table", assert => {
    const {root: initial} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>first name</text>
              </td>
              <td>
                <text>last name</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>John</text>
              </td>
              <td>
                <text>Doe</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    const {root: expected} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td>
                <text>first name</text>
              </td>
              <td>
                <text>last name</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>John</text>
              </td>
              <td>
                <text>Doe</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(ctx.model.rootModelNode, 0, 0);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
});
