import { MarkSet } from '@lblod/ember-rdfa-editor/model/mark';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import { testState } from 'dummy/tests/test-utils';
import { module, test } from 'qunit';

module('Unit | core | transaction-test', function () {
  test('splitUntil splits until predicate true', function (assert) {
    // language=XML
    const {
      root: initial,
      textNodes: { rangeStart },
    } = vdom`
      <modelRoot>
        <div>
          <span>
            <span>
              <text __id="rangeStart">abcd</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;

    // language=XML
    const { root: expected } = vdom`
      <modelRoot>
        <div>
          <span>
            <span>
              <text __id="rangeStart">ab</text>
            </span>
          </span>
          <span>
            <span>
              <text __id="rangeStart">cd</text>
            </span>
          </span>
        </div>
      </modelRoot>
    `;
    const initialState = testState({ document: initial });
    const tr = initialState.createTransaction();
    const position = ModelPosition.fromInTextNode(rangeStart, 2);
    const resultPos = tr.splitUntil(
      position,
      (element) => element.type === 'div'
    );
    const result = tr.apply().document;
    assert.true(result.sameAs(expected));
    assert.true(resultPos.sameAs(ModelPosition.fromPath(result, [0, 1])));
  });
  module('Unit | core | transaction | unwrap', function () {
    test('unwrap simple element', function (assert) {
      // language=XML
      const {
        root: initial,
        elements: { wrapper },
      } = vdom`
          <modelRoot>
            <div __id="wrapper">
              <text>abc</text>
            </div>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <text>abc</text>
          </modelRoot>
        `;

      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const resultRange = tr.unwrap(wrapper);
      const result = tr.apply().document;
      assert.true(result.sameAs(expected));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(result, [0], [3])));
    });

    test('unwrap complex element', function (assert) {
      // language=XML
      const {
        root: initial,
        elements: { wrapper },
      } = vdom`
          <modelRoot>
            <span>
              <text>stuff</text>
            </span>
            <div>

              <div __id="wrapper">
                <text>abc</text>
                <span>
                  <text>hello</text>
                  <text>world</text>
                </span>
                <div/>
              </div>
            </div>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <span>
              <text>stuff</text>
            </span>
            <div>
              <text>abc</text>
              <span>
                <text>hello</text>
                <text>world</text>
              </span>
              <div/>
            </div>
          </modelRoot>
        `;

      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const resultRange = tr.unwrap(wrapper);
      const result = tr.apply().document;
      console.log(result.toXml());
      assert.true(result.sameAs(expected));
      assert.true(
        resultRange.sameAs(ModelRange.fromPaths(result, [1, 0], [1, 5]))
      );
    });
    test('unwrap complex nested elements in sequence', function (assert) {
      // language=XML
      const {
        root: initial,
        elements: { n0, n1, n2, n3 },
      } = vdom`
          <modelRoot>
            <ul>
              <li>
                <text>content0</text>
              </li>
            </ul>
            <ul __id="n0">
              <li __id="n1">
                <ul __id="n2">
                  <li __id="n3">
                    <text __id="n4">content10</text>
                  </li>
                </ul>
              </li>
            </ul>
            <ul>
              <li>
                <ul>
                  <li>
                    <text>content11</text>
                  </li>
                  <li>
                    <text>content12</text>
                  </li>
                </ul>
              </li>
              <li>
                <text>content2</text>
              </li>
            </ul>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <ul>
              <li>
                <text>content0</text>
              </li>
            </ul>
            <text __id="n4">content10</text>
            <ul>
              <li>
                <ul>
                  <li>
                    <text>content11</text>
                  </li>
                  <li>
                    <text>content12</text>
                  </li>
                </ul>
              </li>
              <li>
                <text>content2</text>
              </li>
            </ul>
          </modelRoot>
        `;
      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const n0c = tr.inWorkingCopy(n0);
      const n1c = tr.inWorkingCopy(n1);
      const n2c = tr.inWorkingCopy(n2);
      const n3c = tr.inWorkingCopy(n3);
      tr.unwrap(n0c);
      tr.unwrap(n1c);
      tr.unwrap(n2c);
      tr.unwrap(n3c);

      const result = tr.apply().document;
      assert.true(result.sameAs(expected));
    });
    test('unwrap with ensureBlocks inserts brs correctly', function (assert) {
      // language=XML
      const {
        root: initial,
        elements: { wrapper },
      } = vdom`
          <modelRoot>
            <div>
              <text>abcd</text>
              <div __id="wrapper">
                <text>content</text>
              </div>
              <text>efgh</text>
            </div>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <div>
              <text>abcd</text>
              <br/>
              <text>content</text>
              <br/>
              <text>efgh</text>
            </div>
          </modelRoot>
        `;
      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      tr.unwrap(wrapper, true);
      const result = tr.apply().document;
      assert.true(result.sameAs(expected));
    });
  });
  module('Unit | core | transaction | inserting', function () {
    test('inserts into position correctly', function (assert) {
      // language=XML
      const {
        root: initial,
        textNodes: { rangeStart },
      } = vdom`
          <modelRoot>
            <text __id="rangeStart">abcd</text>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <text>abcd</text>
            <br/>
          </modelRoot>
        `;
      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const pos = ModelPosition.fromAfterNode(rangeStart);
      tr.insertAtPosition(pos, new ModelElement('br'));
      const result = tr.apply().document;
      assert.true(result.sameAs(expected));
    });

    test('inserts into position correctly nested', function (assert) {
      // language=XML
      const { root: initial } = vdom`
          <modelRoot>
            <div>
              <text>abcd</text>
              <text>content</text>
              <text>efgh</text>
            </div>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <div>
              <text>abcd</text>
              <text>content</text>
              <br/>
              <text>efgh</text>
            </div>
          </modelRoot>
        `;
      const range = ModelRange.fromPaths(
        initial as ModelElement,
        [0, 4],
        [0, 11]
      );
      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      tr.insertAtPosition(range.end, new ModelElement('br'));
      const result = tr.apply().document;
      assert.true(result.sameAs(expected));
    });
  });
  module('Unit | core | transaction | splitting', function () {
    test('split simple range', function (assert) {
      // language=XML
      const {
        root: initial,
        textNodes: { rangeStart },
      } = vdom`
          <modelRoot>
            <div>
              <text __id="rangeStart">abcd</text>
            </div>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <div>
              <text>ab</text>
            </div>
            <div>
              <text>cd</text>
            </div>
          </modelRoot>
        `;
      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const range = ModelRange.fromInTextNode(rangeStart, 2, 2);
      const resultRange = tr.splitRangeUntilElements(
        range,
        initial as ModelElement,
        initial as ModelElement,
        false
      );
      const result = tr.apply().document;
      assert.true(result.sameAs(expected));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(result, [1], [1])));
    });

    test('split simple uncollapsed range', function (assert) {
      // language=XML
      const {
        root: initial,
        textNodes: { rangeStart },
      } = vdom`
          <modelRoot>
            <div>
              <text __id="rangeStart">abcd</text>
            </div>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <div>
              <text>a</text>
            </div>
            <div>
              <text>bc</text>
            </div>
            <div>
              <text>d</text>
            </div>
          </modelRoot>
        `;

      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const range = ModelRange.fromInTextNode(rangeStart, 1, 3);
      const resultRange = tr.splitRangeUntilElements(
        range,
        initial as ModelElement,
        initial as ModelElement,
        false
      );
      const result = tr.apply().document;
      assert.true(result.sameAs(expected));

      assert.true(resultRange.sameAs(ModelRange.fromPaths(result, [1], [2])));
    });

    test('split simple uncollapsed range in text (child of root)', function (assert) {
      // language=XML
      const {
        root: initial,
        textNodes: { rangeStart },
      } = vdom`
          <modelRoot>
            <text __id="rangeStart">abcd</text>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <text>a</text>
            <text>bc</text>
            <text>d</text>
          </modelRoot>
        `;

      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const range = ModelRange.fromInTextNode(rangeStart, 1, 3);
      const resultRange = tr.splitRangeUntilElements(
        range,
        initial as ModelElement,
        initial as ModelElement,
        false
      );

      const result = tr.apply().document;
      assert.true(result.sameAs(expected));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(result, [1], [3])));
    });

    test('split simple uncollapsed range selecting div', function (assert) {
      // language=XML
      const { root: initial } = vdom`
          <modelRoot>
            <div>
              <text>abcd</text>
            </div>
            <div>
              <text>efgh</text>
            </div>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <div>
              <text>abcd</text>
            </div>
            <div>
              <text>efgh</text>
            </div>
          </modelRoot>
        `;

      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const range = ModelRange.fromInNode(initial, 0, 1);
      const resultRange = tr.splitRangeUntilElements(
        range,
        initial as ModelElement,
        initial as ModelElement,
        false
      );
      const result = tr.apply().document;
      assert.true(result.sameAs(expected));

      assert.true(resultRange.sameAs(ModelRange.fromPaths(result, [0], [1])));
    });

    test('split uneven uncollapsed range', function (assert) {
      // language=XML
      const {
        root: initial,
        textNodes: { rangeStart, rangeEnd },
      } = vdom`
          <modelRoot>
            <div>
              <text __id="rangeStart">abcd</text>
              <span>
                <text __id="rangeEnd">efgh</text>
              </span>
            </div>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <div>
              <text>a</text>
            </div>
            <div>
              <text>bcd</text>
              <span>
                <text>ef</text>
              </span>
            </div>
            <div>
              <span>
                <text>gh</text>
              </span>
            </div>
          </modelRoot>
        `;
      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const start = ModelPosition.fromInTextNode(rangeStart, 1);
      const end = ModelPosition.fromInTextNode(rangeEnd, 2);
      const range = new ModelRange(start, end);
      const resultRange = tr.splitRangeUntilElements(
        range,
        initial as ModelElement,
        initial as ModelElement,
        false
      );
      const result = tr.apply().document;
      assert.true(result.sameAs(expected));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(result, [1], [2])));
    });

    test('split complex uncollapsed range', function (assert) {
      // language=XML
      const {
        root: initial,
        elements: { rangeContainer },
      } = vdom`
          <modelRoot>
            <ul>
              <li>
                <text>content0</text>
              </li>
              <li>
                <ul __id="rangeContainer">
                  <li>
                    <text>content10</text>
                  </li>
                  <li>
                    <text>content11</text>
                  </li>
                  <li>
                    <text>content12</text>
                  </li>
                </ul>
              </li>
              <li>
                <text>content2</text>
              </li>
            </ul>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <ul>
              <li>
                <text>content0</text>
              </li>
            </ul>
            <ul>
              <li>
                <ul>
                  <li>
                    <text>content10</text>
                  </li>
                </ul>
              </li>
            </ul>
            <ul>
              <li>
                <ul>
                  <li>
                    <text>content11</text>
                  </li>
                  <li>
                    <text>content12</text>
                  </li>
                </ul>
              </li>
              <li>
                <text>content2</text>
              </li>
            </ul>
          </modelRoot>
        `;
      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const range = ModelRange.fromInElement(rangeContainer, 0, 1);
      const resultRange = tr.splitRangeUntilElements(
        range,
        initial as ModelElement,
        initial as ModelElement,
        false
      );
      const result = tr.apply().document;
      assert.true(result.sameAs(expected));
      assert.true(resultRange.sameAs(ModelRange.fromPaths(result, [1], [2])));
    });
  });
  module('Unit | core | transaction | insertText', function () {
    test('insert text into root', function (assert) {
      // language=XML
      const { root: initial } = vdom`
          <modelRoot/>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <text>abc</text>
          </modelRoot>
        `;

      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const range = ModelRange.fromInElement(initial as ModelElement, 0, 0);
      const resultRange = tr.insertText({
        range,
        text: 'abc',
        marks: new MarkSet(),
      });
      const result = tr.apply().document;
      assert.true(result.sameAs(expected));
      assert.true(result.sameAs(expected), QUnit.dump.parse(result));
      assert.true(
        resultRange.sameAs(ModelRange.fromInElement(result, 0, 3)),
        resultRange.toString()
      );
    });

    test('insert empty text into root', function (assert) {
      // language=XML
      const { root: initial } = vdom`
          <modelRoot/>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <text/>
          </modelRoot>
        `;

      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const range = ModelRange.fromInElement(initial as ModelElement, 0, 0);
      const resultRange = tr.insertText({
        range,
        text: '',
        marks: new MarkSet(),
      });
      const result = tr.apply().document;
      assert.true(result.sameAs(expected));
      assert.true(resultRange.sameAs(ModelRange.fromInElement(result, 0, 0)));
    });

    test('insert text into text node merges', function (assert) {
      // language=XML
      const { root: initial } = vdom`
          <modelRoot>
            <text>abef</text>
          </modelRoot>
        `;

      // language=XML
      const { root: expected } = vdom`
          <modelRoot>
            <text>abcdef</text>
          </modelRoot>
        `;

      const initialState = testState({ document: initial });
      const tr = initialState.createTransaction();
      const range = ModelRange.fromInElement(initial as ModelElement, 2, 2);
      const resultRange = tr.insertText({
        range,
        text: 'cd',
        marks: new MarkSet(),
      });
      const result = tr.apply().document;
      assert.true(result.sameAs(expected));

      assert.true(
        resultRange.sameAs(ModelRange.fromInElement(result, 2, 4)),
        resultRange.toString()
      );
    });
  });
});
