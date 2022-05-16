import { module, test } from 'qunit';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import InsertTableRowAboveCommand from '@lblod/ember-rdfa-editor/commands/insert-table-row-above-command';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';

module(
  'Unit | commands | insert-table-row-above-command-test',
  function (hooks) {
    const ctx = new ModelTestContext();
    let command: InsertTableRowAboveCommand;

    hooks.beforeEach(() => {
      ctx.reset();
      command = new InsertTableRowAboveCommand(ctx.model);
    });

    test('inserts above first row (empty td)', function (assert) {
      // language=XML
      const {
        root: initial,
        elements: { topRight },
      } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td __id="topRight"><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
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
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
            </tr>
          </tbody>
        </table>
      </modelRoot>
    `;

      ctx.model.fillRoot(initial);
      const range = ModelRange.fromInNode(topRight, 0, 0);
      ctx.model.selectRange(range);

      command.execute();
      assert.true(ctx.model.rootModelNode.sameAs(expected));
    });

    test('inserts above first row (td with text node)', function (assert) {
      // language=XML
      const {
        root: initial,
        textNodes: { topRight },
      } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td></td>
              <td>
                <text __id="topRight">abcde</text>
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

      // language=XML
      const { root: expected } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
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
      const range = ModelRange.fromInTextNode(topRight, 1, 1);
      ctx.model.selectRange(range);

      command.execute();
      assert.true(ctx.model.rootModelNode.sameAs(expected));
    });

    test('inserts row in the middle (empty td)', function (assert) {
      // language=XML
      const {
        root: initial,
        elements: { middleRight },
      } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td></td>
              <td __id="middleRight"></td>
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
      const { root: expected } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
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
      const range = ModelRange.fromInNode(middleRight, 0, 0);
      ctx.model.selectRange(range);

      command.execute();
      assert.true(ctx.model.rootModelNode.sameAs(expected));
    });

    test('inserts row in the middle (td with text node)', function (assert) {
      // language=XML
      const {
        root: initial,
        textNodes: { middleRight },
      } = vdom`
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
                <text __id="middleRight">abcde</text>
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

      // language=XML
      const { root: expected } = vdom`
      <modelRoot>
        <table>
          <tbody>
            <tr>
              <td></td>
              <td></td>
            </tr>
            <tr>
              <td><text>${INVISIBLE_SPACE}</text></td>
              <td><text>${INVISIBLE_SPACE}</text></td>
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
      const range = ModelRange.fromInTextNode(middleRight, 1, 1);
      ctx.model.selectRange(range);

      command.execute();
      assert.true(ctx.model.rootModelNode.sameAs(expected));
    });
  }
);
