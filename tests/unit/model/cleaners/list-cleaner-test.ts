import { module, test } from 'qunit';
import ListCleaner from '@lblod/ember-rdfa-editor/utils/list-cleaner';
import { vdom } from '@lblod/ember-rdfa-editor/utils/xml-utils';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import { testState } from 'dummy/tests/test-utils';
import ModelElement from '@lblod/ember-rdfa-editor/core/model/nodes/model-element';

module.skip('Unit | model | cleaners | list-cleaner-test', function () {
  test('should merge two adjacent lists', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { container },
    } = vdom`
      <div __id="container">
        <ul>
          <li>
            <text>content00</text>
          </li>
        </ul>
        <ul>
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <ul>
          <li>
            <text>content00</text>
          </li>
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;
    const initialState = testState({ document: initial });
    const tr = initialState.createTransaction();

    const cleaner = new ListCleaner();
    const range = ModelRange.fromInElement(
      initial as ModelElement,
      container,
      0,
      2
    );
    cleaner.clean(range, tr);
    const resultState = tr.apply();

    assert.true(resultState.document.sameAs(expected));
  });

  test('does not merge lists on a different level', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { container },
    } = vdom`
      <div __id="container">
        <ul>
          <li>
            <text>content00</text>
          </li>
        </ul>
        <div>
          <ul>
            <li>
              <text>content10</text>
            </li>
          </ul>
        </div>
      </div>
    `;

    const expected = initial.clone();

    const initialState = testState({ document: initial });
    const tr = initialState.createTransaction();

    const cleaner = new ListCleaner();
    const range = ModelRange.fromInElement(
      initial as ModelElement,
      container,
      0,
      2
    );
    cleaner.clean(range, tr);
    const resultState = tr.apply();

    assert.true(resultState.document.sameAs(expected));
  });

  test('does not merge lists with different attributes', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { container },
    } = vdom`
      <div __id="container">
        <ul test="a">
          <li>
            <text>content00</text>
          </li>
        </ul>
        <ul test="b">
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    const expected = initial.clone();

    const initialState = testState({ document: initial });
    const tr = initialState.createTransaction();

    const cleaner = new ListCleaner();
    const range = ModelRange.fromInElement(
      initial as ModelElement,
      container,
      0,
      2
    );
    cleaner.clean(range, tr);

    const resultState = tr.apply();

    assert.true(resultState.document.sameAs(expected));
  });

  test('should merge lists with different but ignored attributes', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { container },
    } = vdom`
      <div __id="container">
        <ul __dummy_test_attr="a">
          <li>
            <text>content00</text>
          </li>
        </ul>
        <ul __dummy_test_attr="b">
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <ul __dummy_test_attr="b">
          <li>
            <text>content00</text>
          </li>
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    const initialState = testState({ document: initial });
    const tr = initialState.createTransaction();

    const cleaner = new ListCleaner();
    const range = ModelRange.fromInElement(
      initial as ModelElement,
      container,
      0,
      2
    );
    cleaner.clean(range, tr);

    const resultState = tr.apply();

    assert.true(resultState.document.sameAs(expected));
  });
  test('should merge nested lists correctly', function (assert) {
    // language=XML
    const {
      root: initial,
      elements: { container },
    } = vdom`
      <div __id="container">
        <ul>
          <li>
            <text>content00</text>
            <ul>
              <li>
                <text>abc</text>
              </li>
            </ul>
            <ul>
              <li>
                <text>def</text>
              </li>
            </ul>
          </li>
        </ul>
        <ul>
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <ul>
          <li>
            <text>content00</text>
            <ul>
              <li>
                <text>abc</text>
              </li>
              <li>
                <text>def</text>
              </li>
            </ul>
          </li>
          <li>
            <text>content10</text>
          </li>
        </ul>
      </div>
    `;

    const initialState = testState({ document: initial });
    const tr = initialState.createTransaction();
    const cleaner = new ListCleaner();
    const range = ModelRange.fromInElement(
      initial as ModelElement,
      container,
      0,
      2
    );
    cleaner.clean(range, tr);

    const resultState = tr.apply();

    assert.true(resultState.document.sameAs(expected));
  });
});
