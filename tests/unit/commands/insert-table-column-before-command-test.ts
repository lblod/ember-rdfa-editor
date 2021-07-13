import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import InsertTableColumnBeforeCommand from "@lblod/ember-rdfa-editor/commands/insert-table-column-before-command";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | commands | insert-table-column-before-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: InsertTableColumnBeforeCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new InsertTableColumnBeforeCommand(ctx.model);
  });

  test("inserts column before first column (empty table)", assert => {
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
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts column before first column (table filled with text)", assert => {
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
              <td></td>
              <td>
                <text>abcd</text>
              </td>
              <td>
                <text>efgh</text>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>
                <text>ijkl</text>
              </td>
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
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts column in the middle (empty table)", assert => {
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
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts column in the middle (table filled with text)", assert => {
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
    const range = ModelRange.fromInTextNode(bottomRight, 1, 3);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
});
