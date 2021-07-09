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

  test("inserts column before first column (empty td)", assert => {
    // language=XML
    const {root: initial, elements: {bottomLeft}} = vdom`
      <modelRoot>
        <table>
          <tr>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td __id="bottomLeft"></td>
            <td></td>
          </tr>
        </table>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <table>
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
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(bottomLeft, 0, 0);
    ctx.modelSelection.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts column before first column (td with text node)", assert => {
    // language=XML
    const {root: initial, textNodes: {bottomLeft}} = vdom`
      <modelRoot>
        <table>
          <tr>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td>
              <text __id="bottomLeft">abcde</text>
            </td>
            <td></td>
          </tr>
        </table>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <table>
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
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(bottomLeft, 1, 3);
    ctx.modelSelection.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts column in the middle (empty td)", assert => {
    // language=XML
    const {root: initial, elements: {bottomRight}} = vdom`
      <modelRoot>
        <table>
          <tr>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td __id="bottomRight"></td>
          </tr>
        </table>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <table>
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
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(bottomRight, 0, 0);
    ctx.modelSelection.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts column in the middle (td with text node)", assert => {
    // language=XML
    const {root: initial, textNodes: {bottomRight}} = vdom`
      <modelRoot>
        <table>
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
        </table>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <table>
          <tr>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </table>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(bottomRight, 1, 3);
    ctx.modelSelection.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
});
