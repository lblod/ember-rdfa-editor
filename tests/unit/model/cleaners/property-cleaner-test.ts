import { module, test } from 'qunit';
import { vdom } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import PropertyCleaner from '@lblod/ember-rdfa-editor/model/cleaners/property-cleaner';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';

module('Unit | model | cleaners | property-cleaner-test', () => {
  test('should not merge incompatible nodes', (assert) => {
    // language=XML
    const {
      root,
      elements: { container },
    } = vdom`
      <div __id="container">
        <text bold="true">abc</text>
        <text italic="true">def</text>
      </div>`;
    const cleaner = new PropertyCleaner();
    const expected = root.clone();
    const range = ModelRange.fromInElement(container, 0, 2);
    cleaner.clean(range);
    assert.true(root.sameAs(expected));
  });
  test('should merge nodes with same textproperties', (assert) => {
    // language=XML
    const {
      root,
      elements: { container },
    } = vdom`
      <div __id="container">
        <text bold="true">abc</text>
        <text bold="true">def</text>
      </div>`;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <text bold="true">abcdef</text>
      </div>`;

    const cleaner = new PropertyCleaner();
    const range = ModelRange.fromInElement(container, 0, 2);
    cleaner.clean(range);
    assert.true(root.sameAs(expected));
  });
  test('should not merge nodes on different levels', (assert) => {
    // language=XML
    const {
      root,
      elements: { container },
    } = vdom`
      <div __id="container">
        <span>
          <text bold="true">abc</text>
        </span>
        <text bold="true">def</text>
      </div>`;

    const expected = root.clone();
    const cleaner = new PropertyCleaner();
    const range = ModelRange.fromInElement(container, 0, 2);
    cleaner.clean(range);
    assert.true(root.sameAs(expected));
  });

  test('should  merge deep nodes', (assert) => {
    // language=XML
    const {
      root,
      elements: { container },
    } = vdom`
      <div __id="container">
        <span>
          <text bold="true">abc</text>
          <text bold="true">def</text>
        </span>
      </div>`;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <span>
          <text bold="true">abcdef</text>
        </span>
      </div>`;
    const cleaner = new PropertyCleaner();
    const range = ModelRange.fromInElement(container, 0, 1);
    cleaner.clean(range);
    assert.true(root.sameAs(expected));
  });
  test('should  merge many nodes', (assert) => {
    // language=XML
    const {
      root,
      elements: { container },
    } = vdom`
      <div __id="container">
        <span>
          <text bold="true">abc</text>
          <text bold="true">def</text>
          <text bold="true">ghi</text>
          <text bold="true">jkl</text>
          <text bold="true">mno</text>
          <text bold="true">pqr</text>
        </span>
      </div>`;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <span>
          <text bold="true">abcdefghijklmnopqr</text>
        </span>
      </div>`;
    const cleaner = new PropertyCleaner();
    const range = ModelRange.fromInElement(container, 0, 1);
    cleaner.clean(range);
    assert.true(root.sameAs(expected));
  });

  test('should merge nodes with same textproperties not full range', (assert) => {
    // language=XML
    const {
      root,
      textNodes: { rangeStart, rangeEnd },
    } = vdom`
      <div>
        <text bold="true" __id="rangeStart">abc</text>
        <text bold="true" __id="rangeEnd">def</text>
      </div>`;

    // language=XML
    const { root: expected } = vdom`
      <div>
        <text bold="true">abcdef</text>
      </div>`;

    const cleaner = new PropertyCleaner();
    const start = ModelPosition.fromInTextNode(rangeStart, 1);
    const end = ModelPosition.fromInTextNode(rangeEnd, 1);
    const range = new ModelRange(start, end);
    cleaner.clean(range);
    assert.true(root.sameAs(expected));
  });
});
