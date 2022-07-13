import RemoveCommand from '@lblod/ember-rdfa-editor/commands/remove-command';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { NON_BREAKING_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';
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
  test('remove second li', function (assert) {
    const {
      root: initial,
      textNodes: { text },
      elements: { li },
    } = vdom`
      <modelRoot>
        <ul>
          <li><text>abc</text></li>
          <li __id="li"><text __id="text">d</text></li>
        </ul>
      </modelRoot>`;

    const { root: expected } = vdom`
    <modelRoot>
      <ul>
        <li><text>abc</text></li>
      </ul>
    </modelRoot>`;

    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromBeforeNode(li);
    const end = ModelPosition.fromInNode(text, 1);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('remove first li at the beginning of the document', function (assert) {
    const {
      root: initial,
      textNodes: { text },
      elements: { ul },
    } = vdom`
      <modelRoot>
        <ul __id="ul">
          <li><text __id="text">abc</text></li>
          <li><text>d</text></li>
        </ul>
      </modelRoot>`;

    const { root: expected } = vdom`
    <modelRoot>
      <text>abc</text>
      <ul>
        <li><text>d</text></li>
      </ul>
    </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromBeforeNode(ul);
    const end = ModelPosition.fromInNode(text, 0);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('remove first li and its content at the beginning of the document', function (assert) {
    const {
      root: initial,
      textNodes: { text },
      elements: { ul },
    } = vdom`
      <modelRoot>
        <ul __id="ul">
          <li><text __id="text">d</text></li>
          <li><text>abc</text></li>
        </ul>
      </modelRoot>`;

    const { root: expected } = vdom`
    <modelRoot>
      <ul>
        <li><text>abc</text></li>
      </ul>
    </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromBeforeNode(ul);
    const end = ModelPosition.fromInNode(text, 1);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('remove only li at the beginning of the document', function (assert) {
    const {
      root: initial,
      textNodes: { text },
      elements: { ul },
    } = vdom`
      <modelRoot>
        <ul __id="ul">
          <li><text __id="text">abc</text></li>
        </ul>
      </modelRoot>`;

    const { root: expected } = vdom`
    <modelRoot>
      <text>abc</text>
    </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromBeforeNode(ul);
    const end = ModelPosition.fromInNode(text, 0);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('remove only li with content at the beginning of the document', function (assert) {
    const {
      root: initial,
      textNodes: { text },
      elements: { ul },
    } = vdom`
      <modelRoot>
        <ul __id="ul">
          <li><text __id="text">d</text></li>
        </ul>
      </modelRoot>`;

    const { root: expected } = vdom`
    <modelRoot>
      <text></text>
    </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromBeforeNode(ul);
    const end = ModelPosition.fromInNode(text, 1);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('remove break between divs', function (assert) {
    const {
      root: initial,
      elements: { br, div },
    } = vdom`
      <modelRoot>
        <div>
          <text>this is a block and it has a break after it</text>
        </div>
        <br __id="br"/>
        <div __id="div"><text>this block is followed by two breaks</text></div>
      </modelRoot>`;

    const { root: expected } = vdom`
    <modelRoot>
      <div>
        <text>this is a block and it has a break after it</text>
      </div>
      <div __id="div">
        <text>this block is followed by two breaks</text>
      </div>
    </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromBeforeNode(br);
    const end = ModelPosition.fromBeforeNode(div);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('collapse into div', function (assert) {
    const {
      root: initial,
      elements: { div },
      textNodes: { foo },
    } = vdom`
      <modelRoot>
        <div __id="div">
          <text>text</text>
        </div>
        <text __id="foo">foo</text>
      </modelRoot>`;
    const { root: expected } = vdom`
      <modelRoot>
        <div __id="div">
          <text>textfoo</text>
        </div>
      </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromInElement(div, 4);
    const end = ModelPosition.fromBeforeNode(foo);
    // const start = end.shiftedVisually(-1);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('removing second break of two breaks', function (assert) {
    const {
      root: initial,
      textNodes: { foo },
      elements: { br },
    } = vdom`
      <modelRoot>
        <text>baz</text>
        <br/>
        <br __id="br"/>
        <text __id="foo">foo</text>
      </modelRoot>`;
    const { root: expected } = vdom`
      <modelRoot>
        <text>baz</text>
        <br/>
        <text __id="foo">foo</text>
      </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromBeforeNode(br);
    const end = ModelPosition.fromInNode(foo, 0);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('removing invisible span', function (assert) {
    const {
      root: initial,
      textNodes: { foo, baz },
    } = vdom`
      <modelRoot>
        <text __id="baz">baz</text>
        <span></span>
        <text __id="foo">foo</text>
      </modelRoot>`;
    const { root: expected } = vdom`
      <modelRoot>
        <text __id="foo">bazfoo</text>
      </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromInNode(baz, 3);
    const end = ModelPosition.fromInNode(foo, 0);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('collapse into span', function (assert) {
    const {
      root: initial,
      textNodes: { foo, bar },
    } = vdom`
      <modelRoot>
        <text>baz</text>
        <span><text __id="bar">bar</text></span>
        <text __id="foo">foo</text>
      </modelRoot>`;
    const { root: expected } = vdom`
      <modelRoot>
      <text>baz</text>
      <span><text>barfoo</text></span>
      </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromInNode(bar, 3);
    const end = ModelPosition.fromInNode(foo, 0);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('removing br in div', function (assert) {
    const {
      root: initial,
      elements: { br, div },
    } = vdom`
      <modelRoot>
        <div __id="div">
          <text>foo</text>
          <br __id="br"/>
        </div>
      </modelRoot>`;

    const { root: expected } = vdom`
    <modelRoot>
      <div __id="div">
        <text>foo</text>
      </div>
    </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromBeforeNode(br);
    const end = ModelPosition.fromAfterNode(div);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('removing empty div', function (assert) {
    const {
      root: initial,
      textNodes: { foo, baz },
    } = vdom`
      <modelRoot>
        <text __id="baz">baz</text>
        <div></div>
        <text __id="foo">foo</text>
      </modelRoot>`;
    const { root: expected } = vdom`
      <modelRoot>
        <text>bazfoo</text>
      </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromInNode(baz, 3);
    const end = ModelPosition.fromInNode(foo, 0);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('removing lump node', function (assert) {
    const {
      root: initial,
      elements: { div },
    } = vdom`
    <modelRoot>
      <text>baz</text>
        <div __id="div" property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:green">bar</div>
      <text>foo</text>
    </modelRoot>`;

    const { root: expected } = vdom`
      <modelRoot>
        <text>bazfoo</text>
      </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromBeforeNode(div);
    const end = ModelPosition.fromAfterNode(div);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('spaces at the end are preserved', function (assert) {
    const {
      root: initial,
      textNodes: { baz },
    } = vdom`
      <modelRoot>
        <text __id="baz">foobaz${NON_BREAKING_SPACE}t</text>
      </modelRoot>`;
    const { root: expected } = vdom`
      <modelRoot>
        <text __id="baz">foobaz${NON_BREAKING_SPACE}</text>
      </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromInNode(baz, 7);
    const end = ModelPosition.fromInNode(baz, 8);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
  test('spaces at the beginning are preserved', function (assert) {
    const {
      root: initial,
      textNodes: { baz },
    } = vdom`
      <modelRoot>
        <text __id="baz">t${NON_BREAKING_SPACE}foobaz</text>
      </modelRoot>`;
    const { root: expected } = vdom`
      <modelRoot>
        <text __id="baz">${NON_BREAKING_SPACE}foobaz</text>
      </modelRoot>`;
    ctx.model.fillRoot(initial);
    const start = ModelPosition.fromInNode(baz, 0);
    const end = ModelPosition.fromInNode(baz, 1);
    const removeRange = new ModelRange(start, end);
    command.execute(removeRange);
    assert.true(
      ctx.model.rootModelNode.sameAs(expected),
      QUnit.dump.parse(ctx.model.rootModelNode)
    );
  });
});
