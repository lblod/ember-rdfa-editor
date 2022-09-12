import MatchTextCommand from '@lblod/ember-rdfa-editor/commands/match-text-command';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { INVISIBLE_SPACE } from '@lblod/ember-rdfa-editor/utils/constants';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import { makeTestExecute, testState } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module('Unit | commands | match-text-command-text', function () {
  const command = new MatchTextCommand();
  const executeCommand = makeTestExecute(command);
  test('finds text in simple range', function (assert) {
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
    const limitRange = ModelRange.fromInElement(root as ModelElement);
    const initialState = testState({ document: root });
    const { resultValue: result } = executeCommand(initialState, {
      limitRange,
      regex: /test/g,
    });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].text, 'test');
    assert.strictEqual(result[0].index, 4);
    assert.true(result[0].range.sameAs(expectedRange));
  });
  test('match across nodes', function (assert) {
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
    const limitRange = ModelRange.fromInElement(root as ModelElement);
    const initialState = testState({ document: root });
    const { resultValue: result } = executeCommand(initialState, {
      limitRange,
      regex: /3456/g,
    });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].text, '3456');
    assert.strictEqual(result[0].index, 2);
    assert.true(result[0].range.sameAs(expectedRange));
  });
  test('match multiple occurences', function (assert) {
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
    const limitRange = ModelRange.fromInElement(root as ModelElement);
    const initialState = testState({ document: root });

    const { resultValue: results } = executeCommand(initialState, {
      limitRange,
      regex: /test/g,
    });
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

    assert.strictEqual(results.length, 3);
    assert.true(results[0].range.sameAs(expectedRange1));
    assert.true(results[1].range.sameAs(expectedRange2));
    assert.true(results[2].range.sameAs(expectedRange3));
  });
  test('dont match across block nodes', function (assert) {
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
    const limitRange = ModelRange.fromInElement(root as ModelElement);
    const initialState = testState({ document: root });
    const { resultValue: results } = executeCommand(initialState, {
      limitRange,
      regex: /test/g,
    });

    assert.strictEqual(results.length, 0);
  });
  test('match across invisible spaces', function (assert) {
    //language=XML
    const { root } = vdom`
      <modelRoot>
        <div>
          <text>te${INVISIBLE_SPACE}st</text>
        </div>
      </modelRoot>
    `;
    const limitRange = ModelRange.fromInElement(root as ModelElement);
    const initialState = testState({ document: root });
    const { resultValue: results } = executeCommand(initialState, {
      limitRange,
      regex: /test/g,
    });

    assert.strictEqual(results.length, 1);
  });
  test('match block node boundary as newline', function (assert) {
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
    const limitRange = ModelRange.fromInElement(root as ModelElement);
    const initialState = testState({ document: root });
    const { resultValue: results } = executeCommand(initialState, {
      limitRange,
      regex: /te\nst/g,
    });

    const expectedRange = ModelRange.fromPaths(
      root as ModelElement,
      [0, 0],
      [1, 2]
    );
    assert.strictEqual(results.length, 1);

    assert.true(results[0].range.sameAs(expectedRange));
  });
  test('match block nodes as newlines', function (assert) {
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
    const limitRange = ModelRange.fromInElement(root as ModelElement);
    const initialState = testState({ document: root });
    const { resultValue: results } = executeCommand(initialState, {
      limitRange,
      regex: /\n\n\n/g,
    });

    const expectedRange = ModelRange.fromPaths(
      root as ModelElement,
      [1],
      [3, 0]
    );
    assert.strictEqual(results.length, 1);

    assert.true(results[0].range.sameAs(expectedRange));
  });
  test('only match inside of searchRange', function (assert) {
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
    const limitRange = ModelRange.fromInElement(searchContainer);
    const initialState = testState({ document: root });
    const { resultValue: results } = executeCommand(initialState, {
      limitRange,
      regex: /text/g,
    });
    assert.strictEqual(results.length, 1);
    assert.true(results[0].range.sameAs(ModelRange.fromAroundNode(resultNode)));
  });
  test('only match greedy', function (assert) {
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
    const limitRange = ModelRange.fromInElement(searchContainer);
    const initialState = testState({ document: root });
    const { resultValue: results } = executeCommand(initialState, {
      limitRange,
      regex: /t.*/g,
    });
    assert.strictEqual(results.length, 1);
    assert.true(results[0].range.sameAs(ModelRange.fromAroundNode(resultNode)));
  });
});
