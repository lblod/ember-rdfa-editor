import InlineComponentsRegistry from '@lblod/ember-rdfa-editor/model/inline-components/inline-components-registry';
import { highlightMarkSpec } from '@lblod/ember-rdfa-editor/model/mark';
import MarksRegistry from '@lblod/ember-rdfa-editor/model/marks-registry';
import ModelElement from '@lblod/ember-rdfa-editor/model/model-element';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import ModelTable from '@lblod/ember-rdfa-editor/model/model-table';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import {
  HtmlReaderContext,
  readHtml,
} from '@lblod/ember-rdfa-editor/model/readers/html-reader';
import {
  dom,
  domStripped,
  vdom,
} from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import { boldMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/bold';
import { italicMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/italic';
import { strikethroughMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/strikethrough';
import { underlineMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/underline';
import { module, test } from 'qunit';

module('Unit | model | readers | html-reader', function () {
  const marksRegistry = new MarksRegistry();
  const inlineComponentsRegistry = new InlineComponentsRegistry();
  marksRegistry.registerMark(boldMarkSpec);
  marksRegistry.registerMark(italicMarkSpec);
  marksRegistry.registerMark(underlineMarkSpec);
  marksRegistry.registerMark(strikethroughMarkSpec);
  marksRegistry.registerMark(highlightMarkSpec);
  function read(node: Node): ModelNode[] {
    const ctx = new HtmlReaderContext({
      marksRegistry,
      inlineComponentsRegistry,
    });
    return readHtml(node, ctx);
  }

  test('read simple tree', function (assert) {
    const doc = dom`<p>abc</p>`.body.children[0];
    // language=XML
    const { root: expected } = vdom`
      <p>
        <text>abc</text>
      </p>`;

    const actual = read(doc);
    assert.true(actual[0].sameAs(expected));
  });
  test('read tree with textStyle elements', function (assert) {
    const doc = dom`<span><strong>abc</strong></span>`.body.children[0];

    // language=XML
    const { root: expected } = vdom`
      <span>
        <text __marks="bold">abc</text>
      </span>
    `;

    const actual = read(doc);
    assert.true(actual[0].sameAs(expected));
  });

  test('read tree with nested textStyle elements', function (assert) {
    // language=HTML
    const doc = dom`<span><strong><em><u>abc</u></em></strong></span>`.body
      .children[0];

    // language=XML
    const { root: expected } = vdom`
      <span>
        <text __marks="bold,italic,underline">abc</text>
      </span>
    `;

    const actual = read(doc);
    assert.true(actual[0].sameAs(expected));
  });

  test('read tree with nested textStyle elements 2', function (assert) {
    // language=HTML
    const doc = dom`<span><strong><em><u>abc</u>def</em></strong></span>`.body
      .children[0];

    // language=XML
    const { root: expected } = vdom`
      <span>
        <text __marks="bold,italic,underline">abc</text>
        <text __marks="bold,italic">def</text>
      </span>
    `;

    const actual = read(doc);
    assert.true(actual[0].sameAs(expected));
  });

  // Note that the DOM specification limits the types of element which can be children of textStyle elements:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/strong
  // https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#phrasing_content
  test('read tree with nested textStyle elements and other elements', function (assert) {
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
      </span>`.body.children[0];

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

    const actual = read(doc);
    assert.true(actual[0].sameAs(expected));
  });
  test('read tree with highlights', function (assert) {
    // language=HTML
    const doc = domStripped`
      <span>
          <span data-editor-highlight="true">abc</span>
        <strong>
          <span data-editor-highlight="true">def</span>
        </strong>
      </span>`.body.children[0];

    // language=XML
    const { root: expected } = vdom`
      <span>
        <text __id="abc" __marks="highlighted">abc</text>
        <text __id="def" __marks="bold,highlighted">def</text>
      </span>
    `;

    const actual = read(doc);
    assert.true(actual[0].sameAs(expected));
  });
  test('reads table', function (assert) {
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
      </table>`.body.children[0];

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

    const actual = read(doc);

    assert.true(actual[0].sameAs(expected));
    assert.strictEqual(
      (
        ((actual[0].root as ModelTable).getCell(0, 0) as ModelElement)
          .firstChild as ModelText
      ).content,
      'cell00'
    );
  });
  module('Unit | model | readers | html-reader | rdfa attributes', function () {
    test('it should take prefixes from parent elements into account', function (assert) {
      const child = document.createElement('div');
      child.setAttribute('property', 'mu:uuid');
      const parent = document.createElement('div');
      parent.setAttribute(
        'prefix',
        'mu: http://mu.semte.ch/vocabularies/core/ eli: http://data.europa.eu/eli/ontology#'
      );
      parent.appendChild(child);
      const actual = read(child)[0] as ModelElement;
      assert.true(actual.getRdfaPrefixes().has('mu'));
      assert.true(actual.getRdfaPrefixes().has('eli'));
      assert.strictEqual(
        actual.getRdfaPrefixes().get('mu'),
        'http://mu.semte.ch/vocabularies/core/'
      );
      assert.strictEqual(
        actual.getRdfaPrefixes().get('eli'),
        'http://data.europa.eu/eli/ontology#'
      );
      assert.strictEqual(actual.getRdfaAttributes().properties.length, 1);
      assert.strictEqual(
        actual.getRdfaAttributes().properties[0],
        'http://mu.semte.ch/vocabularies/core/uuid'
      );
    });

    test('it should properly expand a property without a prefix when a vocab was provided in the context', function (assert) {
      const child = document.createElement('span');
      child.setAttribute('property', 'title');
      const parent = document.createElement('div');
      parent.setAttribute('vocab', 'http://data.europa.eu/eli/ontology#');
      parent.appendChild(child);
      const actual = read(child)[0] as ModelElement;
      assert.strictEqual(actual.getRdfaAttributes().properties.length, 1);
      assert.strictEqual(
        actual.getRdfaAttributes().properties[0],
        'http://data.europa.eu/eli/ontology#title'
      );
    });

    test('it should properly expand a property without a prefix in a nested child when a vocab was provided in the context', function (assert) {
      const doc = dom`<div><span property="title">my title</span></div>`;
      const child = doc.body.firstChild as HTMLElement;
      const parent = document.createElement('div');
      parent.setAttribute('vocab', 'http://data.europa.eu/eli/ontology#');
      parent.appendChild(child);
      const root = read(child)[0] as ModelElement;
      const actual = root.firstChild as ModelElement;
      assert.strictEqual(actual.getRdfaAttributes().properties.length, 1);
      assert.strictEqual(
        actual.getRdfaAttributes().properties[0],
        'http://data.europa.eu/eli/ontology#title'
      );
    });
  });
});
