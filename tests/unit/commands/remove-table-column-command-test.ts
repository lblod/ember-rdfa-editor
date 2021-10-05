import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import RemoveTableColumnCommand from "@lblod/ember-rdfa-editor/commands/remove-table-column-command";
import {vdom} from "@lblod/ember-rdfa-editor/util/xml-utils"
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import {CORE_OWNER} from "@lblod/ember-rdfa-editor/util/constants"

module("Unit | commands | remove-table-column-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: RemoveTableColumnCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new RemoveTableColumnCommand(ctx.model);
  });

  test("removes only column", assert => {
    // language=XML
    const {root: initial, textNodes: {top}} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text __id="top">abcd</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>efgh</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot></modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(top, 1, 3);
    ctx.model.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("removes first column", assert => {
    // language=XML
    const {root: initial, textNodes: {topLeft}} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text __id="topLeft">abcd</text>
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
                <text>efgh</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>mnop</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(topLeft, 1, 3);
    ctx.model.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("removes last column", assert => {
    // language=XML
    const {root: initial, textNodes: {topRight}} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>abcd</text>
              </td>
              <td>
                <text __id="topRight">efgh</text>
              </td>
            </tr>
            <tr>
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

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>abcd</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>ijkl</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(topRight, 1, 3);
    ctx.model.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("removes middle column", assert => {
    // language=XML
    const {root: initial, textNodes: {topMiddle}} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>abcd</text>
              </td>
              <td>
                <text __id="topMiddle">efgh</text>
              </td>
              <td>
                <text>ijkl</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>mnop</text>
              </td>
              <td>
                <text>qrst</text>
              </td>
              <td>
                <text>uvwx</text>
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
                <text>ijkl</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>mnop</text>
              </td>
              <td>
                <text>uvwx</text>
              </td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(topMiddle, 1, 3);
    ctx.model.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
});
