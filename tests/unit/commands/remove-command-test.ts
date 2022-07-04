import RemoveCommand from '@lblod/ember-rdfa-editor/commands/remove-command';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';
import { module, test } from 'qunit';

module('Unit | commands | remove-command', function (hooks) {
  const ctx = new ModelTestContext();
  let command: RemoveCommand;
  hooks.beforeEach(() => {
    ctx.reset();
    command = new RemoveCommand(ctx.model);
  });
  test('removing part of first li in list', function (assert) {
    const {
      root: initial,
      textNodes: { text1, text2 },
    } = vdom`
      <modelRoot>
        <text __id="text1">test</text>
        <ul>
          <li><text __id="text2">abc</text></li>
          <li><text>abc</text></li>
          <li><text>abc</text></li>
        </ul>
      </modelRoot>`;

    const { root: expected } = vdom`
      <modelRoot>
        <text>tesbc</text>
        <ul>
          <li><text>abc</text></li>
          <li><text>abc</text></li>
        </ul>
      </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromInNode(text1, 3);
    const end = ModelPosition.fromInNode(text2, 1);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('removing part of first li in nested list', function (assert) {
    const {
      root: initial,
      textNodes: { text1, text2 },
    } = vdom`
      <modelRoot>
        <text __id="text1">test</text>
        <ul>
          <li><text>abc</text></li>
          <li>
            <ul>
              <li>
                <text __id="text2">abc</text>
              </li>
            </ul>
          </li>
          <li><text>abc</text></li>
          <li><text>abc</text></li>
        </ul>
      </modelRoot>`;

    const { root: expected } = vdom`
      <modelRoot>
        <text>tesbc</text>
        <ul>
          <li><text>abc</text></li>
          <li><text>abc</text></li>
        </ul>
      </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromInNode(text1, 3);
    const end = ModelPosition.fromInNode(text2, 1);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('removing part of second li in nested list', function (assert) {
    const {
      root: initial,
      textNodes: { text1, text2 },
    } = vdom`
      <modelRoot>
        <text __id="text1">test</text>
        <ul>
          <li><text>abc</text></li>
          <li>
            <ul>
              <li>
                <text>abc</text>
              </li>
              <li>
                <text __id="text2">abc</text>
              </li>
              <li>
                <text>abc</text>
              </li>
              <li>
                <text>abc</text>
              </li>
            </ul>
          </li>
          <li><text>abc</text></li>
          <li><text>abc</text></li>
        </ul>
      </modelRoot>`;

    const { root: expected } = vdom`
      <modelRoot>
        <text>tesbc</text>
        <ul>
          <li><text>abc</text></li>
          <li><text>abc</text></li>
          <li><text>abc</text></li>
          <li><text>abc</text></li>
        </ul>
      </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromInNode(text1, 3);
    const end = ModelPosition.fromInNode(text2, 1);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('removing part of complex nested list', function (assert) {
    const {
      root: initial,
      textNodes: { text1, text2 },
    } = vdom`
      <modelRoot>
        <text __id="text1">111</text>
        <ul>
          <li><text>abc</text></li>
          <li>
            <text>222</text>
            <ul>
              <li>
                <text __id="text2">333</text>
                <ul>
                  <li><text>444</text></li>
                </ul>
              </li>
              <li>
                <text>555</text>
              </li>
            </ul>
          </li>
        </ul>
      </modelRoot>`;

    const { root: expected } = vdom`
      <modelRoot>
        <text>1133</text>
        <ul>
          <li><text>444</text></li>
          <li><text>555</text></li>
        </ul>
      </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromInNode(text1, 2);
    const end = ModelPosition.fromInNode(text2, 1);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
});
