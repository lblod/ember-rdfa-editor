import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import InsertTableRowBelowCommand from "@lblod/ember-rdfa-editor/commands/insert-table-row-below-command";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | commands | insert-table-row-below-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: InsertTableRowBelowCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new InsertTableRowBelowCommand(ctx.model);
  });

  test("inserts below last row (empty td)", assert => {
    // TODO: find out why table in getTableFromSelection is not of type ModelNodeElement

    // language=XML
    const {root: initial, elements: {bottomRight}} = vdom`
      <modelRoot>
        <table class="say-table">
          <tbody>
            <tr>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td __id="bottomRight"></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    // language=XML
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
            <tr>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInNode(bottomRight, 0, 0);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts below last row (td with text node)", assert => {
    // language=XML
    const {root: initial, textNodes: {bottomRight}} = vdom`
      <modelRoot>
        <table class="say-table">
          <tbody>
            <tr>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td>
                <text __id="bottomRight">abcde</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    // language=XML
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
              <td>
                <text>abcde</text>
              </td>
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
    const range = ModelRange.fromInTextNode(bottomRight, 0, 0);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
});
