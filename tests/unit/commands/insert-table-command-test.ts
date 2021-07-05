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

  test("inserts correctly in document with empty text node", assert => {
    const {root: initial} = vdom`
      <modelRoot>
        <text/>
      </modelRoot>
    `;

    const {root: expected} = vdom`
      <modelRoot>
        <text/>
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

  test("inserts correctly inside text node", assert => {
    const {root: initial} = vdom`
      <modelRoot>
        <text>elephant</text>
      </modelRoot>
    `;

    const {root: expected} = vdom`
      <modelRoot>
        <text>ele</text>
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
        <text>phant</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInNode(ctx.model.rootModelNode, 3, 3);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("correctly replace part of text node", assert => {
    const {root: initial} = vdom`
      <modelRoot>
        <text>elephant</text>
      </modelRoot>
    `;

    const {root: expected} = vdom`
      <modelRoot>
        <text>el</text>
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
        <text>ant</text>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInNode(ctx.model.rootModelNode, 2, 5);
    ctx.model.selectRange(range);

    command.execute();
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
});
