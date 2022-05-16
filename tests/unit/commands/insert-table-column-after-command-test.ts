import { module, test } from 'qunit';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import InsertTableColumnAfterCommand from '@lblod/ember-rdfa-editor/commands/insert-table-column-after-command';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';

module(
  'Unit | commands | insert-table-column-after-command-test',
  function (hooks) {
    const ctx = new ModelTestContext();
    let command: InsertTableColumnAfterCommand;

    hooks.beforeEach(() => {
      ctx.reset();
      command = new InsertTableColumnAfterCommand(ctx.model);
    });

    test('inserts column after last column (empty table)', function (assert) {
      // language=XML
      const {
        root: initial,
        elements: { bottomRight },
      } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td __id="bottomRight"><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      // language=XML
      const { root: expected } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
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

    test('inserts column after last column (table filled with text)', function (assert) {
      // language=XML
      const {
        root: initial,
        textNodes: { bottomRight },
      } = vdom`
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
      const { root: expected } = vdom`
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
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td>
                <text>ijkl</text>
              </td>
              <td>
                <text>mnop</text>
              </td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      ctx.model.fillRoot(initial);
      const range = ModelRange.fromInTextNode(bottomRight, 1, 3);
      ctx.modelSelection.selectRange(range);

      command.execute();
      assert.true(ctx.model.rootModelNode.sameAs(expected));
    });

    test('inserts column in the middle (empty table)', function (assert) {
      // language=XML
      const {
        root: initial,
        elements: { bottomLeft },
      } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td __id="bottomLeft"><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      // language=XML
      const { root: expected } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      ctx.model.fillRoot(initial);
      const range = ModelRange.fromInElement(bottomLeft, 0, 0);
      ctx.modelSelection.selectRange(range);

      command.execute();
      assert.true(ctx.model.rootModelNode.sameAs(expected));
    });

    test('inserts column in the middle (table filled with text)', function (assert) {
      // language=XML
      const {
        root: initial,
        textNodes: { bottomLeft },
      } = vdom`
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
      const { root: expected } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td>
                <text>abcd</text>
              </td>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td>
                <text>efgh</text>
              </td>
            </tr>
            <tr>
              <td>
                <text>ijkl</text>
              </td>
              <td><text>${INVISIBLE_SPACE}</text></td>
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

      command.execute();
      assert.true(ctx.model.rootModelNode.sameAs(expected));
    });
  }
);
