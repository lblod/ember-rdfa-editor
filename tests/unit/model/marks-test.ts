import { module, test } from 'qunit';
import { domStripped } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import HtmlReader from '@lblod/ember-rdfa-editor/model/readers/html-reader';
import Model from '@lblod/ember-rdfa-editor/model/model';
import sinon from 'sinon';
import {
  boldMarkSpec,
  highlightMarkSpec,
  italicMarkSpec,
  Mark,
} from '@lblod/ember-rdfa-editor/model/markSpec';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { AssertionError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import HtmlWriter from '@lblod/ember-rdfa-editor/model/writers/html-writer';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';
import HashSet from '@lblod/ember-rdfa-editor/model/util/hash-set';
import ModelTestContext from 'dummy/tests/utilities/model-test-context';

module('Unit | model | marks-test', (hooks) => {
  const ctx = new ModelTestContext();
  hooks.beforeEach(() => {
    ctx.reset();
    ctx.model.registerMark(highlightMarkSpec);
  });
  test('reading works', (assert) => {
    const html = domStripped`
      <strong>abc</strong>
    `;
    const model = new Model(sinon.createStubInstance(HTMLElement));
    model.registerMark(boldMarkSpec);
    const reader = new HtmlReader(model);
    const result = reader.read(html.body.firstChild!)[0];
    if (!ModelNode.isModelText(result)) {
      throw new AssertionError();
    }
    assert.strictEqual(result.content, 'abc');
    assert.true(result.hasMarkName('bold'));
  });

  test('writing works', (assert) => {
    const textNode = new ModelText('abc');
    const mark = new Mark(boldMarkSpec, {}, textNode);
    textNode.addMark(mark);

    const model = new Model(sinon.createStubInstance(HTMLElement));
    model.registerMark(boldMarkSpec);
    const writer = new HtmlWriter(model);
    const result = writer.write(textNode);
    assert.true(isElement(result));
    assert.strictEqual(tagName(result), 'strong');
    assert.strictEqual(result.childNodes.length, 1);
    assert.strictEqual((result.firstChild as Text).textContent, 'abc');
  });
  test('writing works with multiple marks', (assert) => {
    const textNode = new ModelText('abc');
    textNode.addMark(new Mark(boldMarkSpec, {}, textNode));
    textNode.addMark(new Mark(italicMarkSpec, {}, textNode));

    const model = new Model(sinon.createStubInstance(HTMLElement));
    model.registerMark(boldMarkSpec);
    model.registerMark(italicMarkSpec);
    const writer = new HtmlWriter(model);
    const result = writer.write(textNode);
    assert.true(isElement(result));
    assert.strictEqual(tagName(result), 'em');
    assert.strictEqual(result.childNodes.length, 1);

    const fc = result.firstChild!;

    assert.true(isElement(fc));
    assert.strictEqual(tagName(fc), 'strong');
    assert.strictEqual(fc.childNodes.length, 1);
    assert.true(isTextNode(fc.firstChild!));
    assert.strictEqual(fc.firstChild!.textContent, 'abc');
  });
  test('reading highlights works', (assert) => {
    const html = domStripped`
      <span data-editor-highlight>abc</span>
    `;
    const model = new Model(sinon.createStubInstance(HTMLElement));
    model.registerMark(highlightMarkSpec);
    const reader = new HtmlReader(model);
    const result = reader.read(html.body.firstChild!)[0];
    if (!ModelNode.isModelText(result)) {
      throw new AssertionError();
    }
    assert.strictEqual(result.content, 'abc');
    assert.true(result.hasMarkName('highlighted'));
  });
  test("reading non-highlight spans doesn't read highlight marks", (assert) => {
    const html = domStripped`
      <span>abc</span>
    `;
    const model = new Model(sinon.createStubInstance(HTMLElement));
    model.registerMark(highlightMarkSpec);
    const reader = new HtmlReader(model);
    const result = reader.read(html.body.firstChild!)[0];
    if (!ModelNode.isModelElement(result)) {
      throw new AssertionError();
    }
    assert.strictEqual((result.firstChild as ModelText).content, 'abc');
    assert.false((result.firstChild as ModelText).hasMarkName('highlighted'));
  });
  test('hashset', (assert) => {
    const set = new HashSet({
      hashFunc: (item) => item.name,
      init: [{ name: 'test1' }, { name: 'test2' }],
    });

    set.deleteHash('test2');
    assert.strictEqual(set.size, 1);
  });
});
