import { module, test } from 'qunit';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';
import HtmlReader from '@lblod/ember-rdfa-editor/model/readers/html-reader';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import {
  dom,
  domStripped,
  vdom,
} from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import ModelTable from '@lblod/ember-rdfa-editor/model/model-table';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import {
  boldMarkSpec,
  highlightMarkSpec,
  italicMarkSpec,
  strikethroughMarkSpec,
  underlineMarkSpec,
} from '@lblod/ember-rdfa-editor/model/markSpec';

module('Unit | model | readers | html-reader', (hooks) => {
  let reader: HtmlReader;
  const ctx = new ModelTestContext();
  hooks.beforeEach(() => {
    ctx.reset();
    ctx.model.registerMark(boldMarkSpec);
    ctx.model.registerMark(italicMarkSpec);
    ctx.model.registerMark(underlineMarkSpec);
    ctx.model.registerMark(strikethroughMarkSpec);
    ctx.model.registerMark(highlightMarkSpec);
    reader = new HtmlReader(ctx.model);
  });

  test('read simple tree', (assert) => {
    const doc = dom`<p>abc</p>`;
    // language=XML
    const { root: expected } = vdom`
      <p>
        <text>abc</text>
      </p>`;

    const actual = reader.read(doc.body.firstChild!)!;
    assert.true(actual[0].sameAs(expected));
  });
  test('read tree with textStyle elements', (assert) => {
    const doc = dom`<span><strong>abc</strong></span>`;

    // language=XML
    const { root: expected } = vdom`
      <span>
        <text __marks="bold">abc</text>
      </span>
    `;

    const actual = reader.read(doc.body.firstChild!)!;
    assert.true(actual[0].sameAs(expected));
  });

  test('read tree with nested textStyle elements', (assert) => {
    // language=HTML
    const doc = dom`<span><strong><em><u>abc</u></em></strong></span>`;

    // language=XML
    const { root: expected } = vdom`
      <span>
        <text __marks="bold,italic,underline">abc</text>
      </span>
    `;

    const actual = reader.read(doc.body.firstChild!)!;
    assert.true(actual[0].sameAs(expected));
  });

  test('read tree with nested textStyle elements 2', (assert) => {
    // language=HTML
    const doc = dom`<span><strong><em><u>abc</u>def</em></strong></span>`;

    // language=XML
    const { root: expected } = vdom`
      <span>
        <text __marks="bold,italic,underline">abc</text>
        <text __marks="bold,italic">def</text>
      </span>
    `;

    const actual = reader.read(doc.body.firstChild!)!;
    assert.true(actual[0].sameAs(expected));
  });

  // Note that the DOM specification limits the types of element which can be children of textStyle elements:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/strong
  // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#phrasing_content
  test('read tree with nested textStyle elements and other elements', (assert) => {
    // language=HTML
    const doc = domStripped`
      <span>
        <strong>
          <br/>
          <em>
            <br/>
            <u>abc</u>
            <span>def</span>
            ghi
          </em>
        </strong>
      </span>`;

    // language=XML
    const { root: expected } = vdom`
      <span>
        <br/>
        <br/>
        <text __marks="bold,italic,underline">abc</text>
        <span>
          <text __marks="bold,italic">def</text>
        </span>
        <text __marks="bold,italic">ghi</text>
      </span>
    `;

    const actual = reader.read(doc.body.firstChild!)!;
    assert.true(actual[0].sameAs(expected));
  });
  test('read tree with highlights', (assert) => {
    // language=HTML
    const doc = domStripped`
      <span>
          <span data-editor-highlight="true">abc</span>
        <strong>
          <span data-editor-highlight="true">def</span>
        </strong>
      </span>`;

    // language=XML
    const { root: expected, textNodes: {abc, def} } = vdom`
      <span>
        <text __id="abc" __marks="highlighted">abc</text>
        <text __id="def" __marks="bold,highlighted">def</text>
      </span>
    `;

    const actual = reader.read(doc.body.firstChild!)!;
    assert.true(actual[0].sameAs(expected));
  });
  test('reads table', (assert) => {
    // language=HTML
    const doc = domStripped`
      <table>
        <tbody>
        <tr>
          <th>cell00</th>
          <th>cell01</th>
        </tr>
        <tr>
          <th>cell10</th>
          <th>cell11</th>
        </tr>
        </tbody>
      </table>`;

    // language=XML
    const { root: expected } = vdom`
      <table>
        <tbody>
          <tr>
            <th>
              <text>cell00</text>
            </th>
            <th>
              <text>cell01</text>
            </th>
          </tr>
          <tr>
            <th>
              <text>cell10</text>
            </th>
            <th>
              <text>cell11</text>
            </th>
          </tr>
        </tbody>
      </table>
    `;

    const actual = reader.read(doc.body.firstChild!)!;

    assert.true(actual[0].sameAs(expected));
    assert.strictEqual(
      (
        ((actual[0].root as ModelTable).getCell(0, 0) as ModelElement)
          .firstChild as ModelText
      ).content,
      'cell00'
    );
  });
  module('Unit | model | readers | html-reader | rdfa attributes', () => {
    test('it should take prefixes from parent elements into account', (assert) => {
      const child = document.createElement('div');
      child.setAttribute('property', 'mu:uuid');
      const parent = document.createElement('div');
      parent.setAttribute(
        'prefix',
        'mu: http://mu.semte.ch/vocabularies/core/ eli: http://data.europa.eu/eli/ontology#'
      );
      parent.appendChild(child);
      const actual = reader.read(child)[0] as ModelElement;
      assert.true(actual.getRdfaPrefixes().has('mu'));
      assert.true(actual.getRdfaPrefixes().has('eli'));
      assert.equal(
        actual.getRdfaPrefixes().get('mu'),
        'http://mu.semte.ch/vocabularies/core/'
      );
      assert.equal(
        actual.getRdfaPrefixes().get('eli'),
        'http://data.europa.eu/eli/ontology#'
      );
      assert.equal(actual.getRdfaAttributes().properties.length, 1);
      assert.equal(
        actual.getRdfaAttributes().properties[0],
        'http://mu.semte.ch/vocabularies/core/uuid'
      );
    });

    test('it should properly expand a property without a prefix when a vocab was provided in the context', (assert) => {
      const child = document.createElement('span');
      child.setAttribute('property', 'title');
      const parent = document.createElement('div');
      parent.setAttribute('vocab', 'http://data.europa.eu/eli/ontology#');
      parent.appendChild(child);
      const actual = reader.read(child)[0] as ModelElement;
      assert.equal(actual.getRdfaAttributes().properties.length, 1);
      assert.equal(
        actual.getRdfaAttributes().properties[0],
        'http://data.europa.eu/eli/ontology#title'
      );
    });

    test('it should properly expand a property without a prefix in a nested child when a vocab was provided in the context', (assert) => {
      const doc = dom`<div><span property="title">my title</span></div>`;
      const child = doc.body.firstChild as HTMLElement;
      const parent = document.createElement('div');
      parent.setAttribute('vocab', 'http://data.europa.eu/eli/ontology#');
      parent.appendChild(child);
      const root = reader.read(child)[0] as ModelElement;
      const actual = root.firstChild as ModelElement;
      assert.equal(actual.getRdfaAttributes().properties.length, 1);
      assert.equal(
        actual.getRdfaAttributes().properties[0],
        'http://data.europa.eu/eli/ontology#title'
      );
    });
  });
});
