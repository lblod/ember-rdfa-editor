import {module, test} from "qunit";
import ModelTestContext from "dummy/tests/utilities/model-test-context";
import RemoveTableCommand from "@lblod/ember-rdfa-editor/commands/remove-table-command";
import {vdom} from "@lblod/ember-rdfa-editor/model/util/xml-utils";
import ModelRange from "@lblod/ember-rdfa-editor/model/model-range";
import {CORE_OWNER} from "@lblod/ember-rdfa-editor/model/util/constants";

module("Unit | commands | remove-table-command-test", hooks => {
  const ctx = new ModelTestContext();
  let command: RemoveTableCommand;

  hooks.beforeEach(() => {
    ctx.reset();
    command = new RemoveTableCommand(ctx.model);
  });

  test("removes empty table (only element in document)", assert => {
    // language=XML
    const {root: initial, elements: {topLeft}} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td __id="topLeft"></td>
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

    // language=XML
    const {root: expected} = vdom`
      <modelRoot></modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInElement(topLeft, 0, 0);
    ctx.model.selectRange(range);

    command.execute(CORE_OWNER);
    const resultRange = ctx.modelSelection.lastRange;
    const expectedRange = ModelRange.fromPaths(ctx.model.rootModelNode, [0], [0]);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    assert.true(resultRange && expectedRange.sameAs(resultRange));
  });

  test("removes table filled with text (only element in document)", assert => {
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
      <modelRoot></modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(topLeft, 1, 3);
    ctx.model.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    const resultRange = ctx.modelSelection.lastRange;
    const expectedRange = ModelRange.fromPaths(ctx.model.rootModelNode, [0], [0]);
    assert.true(resultRange && expectedRange.sameAs(resultRange));
  });

  test("removes correctly before table", assert => {
    // language=XML
    const {root: initial, textNodes: {topLeft}} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text __id="topLeft">first1</text>
              </td>
              <td>
                <text>first2</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>first3</text>
              </td>
              <td>
                <text>first4</text>
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td>
                <text>second1</text>
              </td>
              <td>
                <text>second2</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>second3</text>
              </td>
              <td>
                <text>second4</text>
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
                <text>second1</text>
              </td>
              <td>
                <text>second2</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>second3</text>
              </td>
              <td>
                <text>second4</text>
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
    const resultRange = ctx.modelSelection.lastRange;
    const expectedRange = ModelRange.fromPaths(ctx.model.rootModelNode, [0], [0]);
    assert.true(resultRange && expectedRange.sameAs(resultRange));
  });

  test("removes correctly after table", assert => {
    // language=XML
    const {root: initial, textNodes: {topLeft}} = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>first1</text>
              </td>
              <td>
                <text>first2</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>first3</text>
              </td>
              <td>
                <text>first4</text>
              </td>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td>
                <text __id="topLeft">second1</text>
              </td>
              <td>
                <text>second2</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>second3</text>
              </td>
              <td>
                <text>second4</text>
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
                <text>first1</text>
              </td>
              <td>
                <text>first2</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>first3</text>
              </td>
              <td>
                <text>first4</text>
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
    const resultRange = ctx.modelSelection.lastRange;
    const expectedRange = ModelRange.fromPaths(ctx.model.rootModelNode, [1], [1]);
    assert.true(resultRange && expectedRange.sameAs(resultRange));
  });

  test("removes correctly before list", assert => {
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
        <ul>
          <li>
            <text>li1</text>
          </li>
          <li>
            <text>li2</text>
          </li>
          <li>
            <text>li3</text>
          </li>
        </ul>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>li1</text>
          </li>
          <li>
            <text>li2</text>
          </li>
          <li>
            <text>li3</text>
          </li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(topLeft, 1, 3);
    ctx.model.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    const resultRange = ctx.modelSelection.lastRange;
    const expectedRange = ModelRange.fromPaths(ctx.model.rootModelNode, [0], [0]);
    assert.true(resultRange && expectedRange.sameAs(resultRange));
  });

  test("removes after before list", assert => {
    // language=XML
    const {root: initial, textNodes: {topLeft}} = vdom`
      <modelRoot>
        <ul>
          <li>
            <text>li1</text>
          </li>
          <li>
            <text>li2</text>
          </li>
          <li>
            <text>li3</text>
          </li>
        </ul>
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
        <ul>
          <li>
            <text>li1</text>
          </li>
          <li>
            <text>li2</text>
          </li>
          <li>
            <text>li3</text>
          </li>
        </ul>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(topLeft, 1, 3);
    ctx.model.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    const resultRange = ctx.modelSelection.lastRange;
    const expectedRange = ModelRange.fromPaths(ctx.model.rootModelNode, [1], [1]);
    assert.true(resultRange && expectedRange.sameAs(resultRange));
  });

  test("removes correctly in div", assert => {
    // language=XML
    const {root: initial, textNodes: {topLeft}} = vdom`
      <modelRoot>
        <div>
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
        </div>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div></div>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(topLeft, 1, 3);
    ctx.model.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    const resultRange = ctx.modelSelection.lastRange;
    const expectedRange = ModelRange.fromPaths(ctx.model.rootModelNode, [0,0], [0,0]);
    assert.true(resultRange && expectedRange.sameAs(resultRange));
  });
  test("removes correctly in div after text", assert => {
    // language=XML
    const {root: initial, textNodes: {topLeft}} = vdom`
      <modelRoot>
        <div>
          <text>01234567</text>
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
        </div>
      </modelRoot>
    `;

    // language=XML
    const {root: expected} = vdom`
      <modelRoot>
        <div><text>01234567</text></div>
      </modelRoot>
    `;

    ctx.model.fillRoot(initial);
    const range = ModelRange.fromInTextNode(topLeft, 1, 3);
    ctx.model.selectRange(range);

    command.execute(CORE_OWNER);
    assert.true(ctx.model.rootModelNode.sameAs(expected));
    const resultRange = ctx.modelSelection.lastRange;
    const expectedRange = ModelRange.fromPaths(ctx.model.rootModelNode, [0,8], [0,8]);
    assert.true(resultRange && expectedRange.sameAs(resultRange));
  });
});
