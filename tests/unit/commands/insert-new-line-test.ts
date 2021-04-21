import {module, test} from "qunit";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import {INVISIBLE_SPACE} from "@lblod/ember-rdfa-editor/model/util/constants";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import InsertNewLineCommand from "@lblod/ember-rdfa-editor/commands/insert-newLine-command";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";

module("Unit | commands | insert-new-line-test", hooks => {
  const ctx = new ModelTestContext();
  let command: InsertNewLineCommand;
  hooks.beforeEach(() => {
    ctx.reset();
    command = new InsertNewLineCommand(ctx.model);
  });
  test("inserts a new line before a table", assert => {

    // language=XML
    const {root: initial, textNodes:{rangeMarker}} = vdom`
      <modelRoot>
        <text>
        </text>
        <text __id="rangeMarker">Before the table${INVISIBLE_SPACE}</text>
        <table class="say-table">
          <thead>
            <tr>
              <th>
                <text>h1${INVISIBLE_SPACE}</text>
              </th>
              <th>
                <text>h2${INVISIBLE_SPACE}</text>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <text>c1${INVISIBLE_SPACE}</text>
              </td>
              <td>
                <text>c2${INVISIBLE_SPACE}</text>
              </td>
            </tr>
          </tbody>
        </table>
        <text>${INVISIBLE_SPACE}After the table
        </text>
      </modelRoot>
    `;


    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <text>
        </text>
        <text>Before the table${INVISIBLE_SPACE}</text>
        <br />
        <table class="say-table">
          <thead>
            <tr>
              <th>
                <text>h1${INVISIBLE_SPACE}</text>
              </th>
              <th>
                <text>h2${INVISIBLE_SPACE}</text>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <text>c1${INVISIBLE_SPACE}</text>
              </td>
              <td>
                <text>c2${INVISIBLE_SPACE}</text>
              </td>
            </tr>
          </tbody>
        </table>
        <text>${INVISIBLE_SPACE}After the table
        </text>
      </modelRoot>
    `;
    ctx.model.fillRoot(initial);
    ctx.model.disableSelectionWriting();
    console.log(ctx.model.toXml());
    const range = ModelRange.fromInTextNode(rangeMarker, rangeMarker.length, rangeMarker.length);
    command.execute(range);

    assert.true(ctx.model.rootModelNode.sameAs(expected));
    assert.deepEqual(ctx.modelSelection.lastRange?.start.path.length, range.start.path.length);
    assert.deepEqual(ctx.modelSelection.lastRange?.start.parentOffset, range.start.parentOffset + 1);

  });
});
