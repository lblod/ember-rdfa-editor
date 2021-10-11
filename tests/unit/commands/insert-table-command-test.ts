import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/util/xml-utils";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import ModelRange from "@lblod/ember-rdfa-editor/core/model/model-range";
import ModelPosition from "@lblod/ember-rdfa-editor/core/model/model-position";
import {CORE_OWNER} from "@lblod/ember-rdfa-editor/util/constants";
import InsertTableCommand from "tables-plugin/commands/insert-table-command";

module("Unit | commands | insert-table-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: InsertTableCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new InsertTableCommand(ctx.model);
  });

  test("inserts correctly in empty document", assert => {
    // language=XML
    const {root: initial} = vdom`
      <modelRoot/>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <table class="say-table">
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
    ctx.model.selection.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts correctly in document with empty text node", assert => {
    // language=XML
    const {root: initial} = vdom`
      <modelRoot>
        <text/>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text/>
        <table class="say-table">
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
    ctx.model.selection.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts correctly before table", assert => {
    // language=XML
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

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <table class="say-table">
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
    ctx.model.selection.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("inserts correctly inside text node", assert => {
    // language=XML
    const {root: initial} = vdom`
      <modelRoot>
        <text>elephant</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>ele</text>
        <table class="say-table">
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
    ctx.model.selection.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("correctly replaces part of text node", assert => {
    // language=XML
    const {root: initial} = vdom`
      <modelRoot>
        <text>elephant</text>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>el</text>
        <table class="say-table">
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
    ctx.model.selection.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });

  test("correctly replaces complex range", assert => {
    // language=XML
    const {root: initial, textNodes: {rangeStart, rangeEnd}} = vdom`
      <modelRoot>
        <div>
          <text __id="rangeStart">elephant</text>
          <span>
            <span/>
            <span>
              <text __id="rangeEnd">monkey</text>
            </span>
            <span/>
          </span>
        </div>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div>
          <text>ele</text>
          <table class="say-table">
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
          <span>
            <span>
              <text>key</text>
            </span>
            <span/>
          </span>
        </div>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = new ModelRange(
      ModelPosition.fromInTextNode(rangeStart, 3),
      ModelPosition.fromInTextNode(rangeEnd, 3)
    );
    ctx.model.selection.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
  });
});
