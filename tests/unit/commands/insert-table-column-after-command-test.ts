import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import {vdom} from "@lblod/ember-rdfa-editor/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import {CORE_OWNER} from "@lblod/ember-rdfa-editor/util/constants";
import InsertTableColumnAfterCommand from "tables-plugin/commands/insert-table-column-after-command";

module("Unit | commands | insert-table-column-after-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: InsertTableColumnAfterCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new InsertTableColumnAfterCommand(ctx.model);
  });

  test("inserts column after last column (empty table)", assert => {
    // language=XML
    const {root: initial, elements: {bottomRight}} = vdom`
      <modelRoot>
        <table>
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
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(bottomRight, 0, 0);
    ctx.model.selection.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts column after last column (table filled with text)", assert => {
    // language=XML
    const {root: initial, textNodes: {bottomRight}} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>abcd</text>
              </td>
              <td>
                <text>efgh</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>ijkl</text>
              </td>
              <td>
                <text __id="bottomRight">mnop</text>
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
              <td>
                <text>abcd</text>
              </td>
              <td>
                <text>efgh</text>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>
                <text>ijkl</text>
              </td>
              <td>
                <text>mnop</text>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(bottomRight, 1, 3);
    ctx.modelSelection.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts column in the middle (empty table)", assert => {
    // language=XML
    const {root: initial, elements: {bottomLeft}} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td __id="bottomLeft"></td>
              <td></td>
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
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(bottomLeft, 0, 0);
    ctx.modelSelection.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts column in the middle (table filled with text)", assert => {
    // language=XML
    const {root: initial, textNodes: {bottomLeft}} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>abcd</text>
              </td>
              <td>
                <text>efgh</text>
              </td>
            </tr>
            <tr>
              <td>
                <text __id="bottomLeft">ijkl</text>
              </td>
              <td>
                <text>mnop</text>
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
              <td>
                <text>abcd</text>
              </td>
              <td></td>
              <td>
                <text>efgh</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>ijkl</text>
              </td>
              <td></td>
              <td>
                <text>mnop</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(bottomLeft, 1, 3);
    ctx.modelSelection.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
});
