import { module, test } from 'qunit';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';
import MatchTextCommand from '@lblod/ember-rdfa-editor/commands/match-text-command';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';

module('Unit | commands | match-text-command-text', (hooks) => {
  const ctx = new ModelTestContext();
  let command: MatchTextCommand;
  hooks.beforeEach(() => {
    ctx.reset();
    command = new MatchTextCommand(ctx.model);
  });
  test('finds text in simple range', (assert) => {
    //language=XML
    const {
      root,
      textNodes: { contentNode },
    } = vdom`
      <modelRoot>
        <text __id="contentNode">xxxxtestxxx</text>
      </modelRoot>
    `;

    const expectedRange = ModelRange.fromInNode(contentNode, 4, 8);
    const result = command.execute(
      ModelRange.fromInElement(root as ModelElement),
      /test/g
    );
    ctx.model.fillRoot(root);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].text, 'test');
    assert.strictEqual(result[0].index, 4);
    assert.true(result[0].range.sameAs(expectedRange));
  });
  test('match across nodes', (assert) => {
    //language=XML
    const { root } = vdom`
      <modelRoot>
        <text>1234</text>
        <span>
          <text>5678</text>
        </span>
      </modelRoot>
    `;
    const expectedRange = ModelRange.fromPaths(
      root as ModelElement,
      [2],
      [4, 2]
    );
    const searchRange = ModelRange.fromInElement(root as ModelElement);
    const result = command.execute(searchRange, /3456/);
    ctx.model.fillRoot(root);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].text, '3456');
    assert.strictEqual(result[0].index, 2);
    assert.true(result[0].range.sameAs(expectedRange));
  });
  test('match multiple occurences', (assert) => {
    //language=XML
    const { root } = vdom`
      <modelRoot>
        <text>te</text>
        <text>st</text>
        <span>
          <text>test</text>
        </span>

        <span>
          <text>t</text>
        </span>
        <span>
          <span>
            <text>es</text>
          </span>
        </span>
        <span>
          <text>t</text>
        </span>
      </modelRoot>
    `;
    const searchRange = ModelRange.fromInElement(root as ModelElement);
    const results = command.execute(searchRange, /test/g);
    const expectedRange1 = ModelRange.fromPaths(root as ModelElement, [0], [4]);
    const expectedRange2 = ModelRange.fromPaths(
      root as ModelElement,
      [4, 0],
      [4, 4]
    );
    const expectedRange3 = ModelRange.fromPaths(
      root as ModelElement,
      [5, 0],
      [7, 1]
    );

    ctx.model.fillRoot(root as ModelElement);
    assert.strictEqual(results.length, 3);
    assert.true(results[0].range.sameAs(expectedRange1));
    assert.true(results[1].range.sameAs(expectedRange2));
    assert.true(results[2].range.sameAs(expectedRange3));
  });
  test('dont match across block nodes', (assert) => {
    //language=XML
    const { root } = vdom`
      <modelRoot>
        <div>
          <text>te</text>
        </div>
        <div>
          <text>st</text>
        </div>
      </modelRoot>
    `;
    const searchRange = ModelRange.fromInElement(root as ModelElement);
    const results = command.execute(searchRange, /test/g);

    ctx.model.fillRoot(root as ModelElement);
    assert.strictEqual(results.length, 0);
  });
  test('match across invisible spaces', (assert) => {
    //language=XML
    const { root } = vdom`
      <modelRoot>
        <div>
          <text>te${INVISIBLE_SPACE}st</text>
        </div>
      </modelRoot>
    `;
    const searchRange = ModelRange.fromInElement(root as ModelElement);
    const results = command.execute(searchRange, /test/g);

    ctx.model.fillRoot(root as ModelElement);
    assert.strictEqual(results.length, 1);
  });
  test('match block node boundary as newline', (assert) => {
    //language=XML
    const { root } = vdom`
      <modelRoot>
        <div>
          <text>te</text>
        </div>
        <div>
          <text>st</text>
        </div>
      </modelRoot>
    `;
    const searchRange = ModelRange.fromInElement(root as ModelElement);
    const results = command.execute(searchRange, /te\nst/g);

    const expectedRange = ModelRange.fromPaths(
      root as ModelElement,
      [0, 0],
      [1, 2]
    );
    ctx.model.fillRoot(root as ModelElement);
    assert.strictEqual(results.length, 1);

    assert.true(results[0].range.sameAs(expectedRange));
  });
  test('match block nodes as newlines', (assert) => {
    //language=XML
    const { root } = vdom`
      <modelRoot>
        <span>text</span>
        <br/>
        <div/>
        <div>
          <text>st</text>
        </div>
      </modelRoot>
    `;
    const searchRange = ModelRange.fromInElement(root as ModelElement);
    const results = command.execute(searchRange, /\n\n\n/g);

    const expectedRange = ModelRange.fromPaths(
      root as ModelElement,
      [1],
      [3, 0]
    );
    ctx.model.fillRoot(root as ModelElement);
    assert.strictEqual(results.length, 1);

    assert.true(results[0].range.sameAs(expectedRange));
  });
  test('only match inside of searchRange', (assert) => {
    //language=XML
    const {
      root,
      textNodes: { resultNode },
      elements: { searchContainer },
    } = vdom`
      <modelRoot>
        <div __id="searchContainer">
          <span><text __id="resultNode">text</text></span>
        </div>
        <span>text</span>
      </modelRoot>
    `;
    const searchRange = ModelRange.fromInElement(searchContainer);
    const results = command.execute(searchRange, /text/g);
    assert.strictEqual(results.length, 1);
    assert.true(results[0].range.sameAs(ModelRange.fromAroundNode(resultNode)));
  });
  test('only match greedy', (assert) => {
    //language=XML
    const {
      root,
      textNodes: { resultNode },
      elements: { searchContainer },
    } = vdom`
      <modelRoot>
        <div __id="searchContainer">
          <span><text __id="resultNode">text</text></span>
        </div>
        <span>text</span>
      </modelRoot>
    `;
    const searchRange = ModelRange.fromInElement(searchContainer);
    const results = command.execute(searchRange, /t.*/g);
    assert.strictEqual(results.length, 1);
    assert.true(results[0].range.sameAs(ModelRange.fromAroundNode(resultNode)));
  });
});
