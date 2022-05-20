import { module, test } from 'qunit';
import { domStripped } from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import HtmlReader from '@lblod/ember-rdfa-editor/model/readers/html-reader';
import Model from '@lblod/ember-rdfa-editor/model/model';
import sinon from 'sinon';
import { highlightMarkSpec, Mark } from '@lblod/ember-rdfa-editor/model/mark';
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
import { boldMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/bold';
import { italicMarkSpec } from '@lblod/ember-rdfa-editor/plugins/basic-styles/marks/italic';
import ModelPosition from '@lblod/ember-rdfa-editor/model/model-position';
import ModelRange from '@lblod/ember-rdfa-editor/model/model-range';
import MarkOperation from '@lblod/ember-rdfa-editor/model/operations/mark-operation';

function testMarkToggling(
  assert: Assert,
  start: number,
  end: number,
  model: Model
) {
  const textStr = 'abcdefghi';
  const text = new ModelText(textStr);
  text.addMark(new Mark(italicMarkSpec, {}, text));
  model.rootModelNode.appendChildren(text);
  const rangeBeginning = new ModelRange(
    ModelPosition.fromInTextNode(text, start),
    ModelPosition.fromInTextNode(text, end)
  );
  const op1 = new MarkOperation(
    undefined,
    rangeBeginning,
    boldMarkSpec,
    {},
    'add'
  );
  const op2 = new MarkOperation(
    undefined,
    rangeBeginning,
    boldMarkSpec,
    {},
    'remove'
  );
  op1.execute();
  model.write();
  op2.execute();
  model.write();
  op1.execute();
  model.write();
  op2.execute();
  model.write();

  assert.strictEqual(model.rootNode.childNodes.length, 1);
  const emNode = model.rootNode.childNodes[0];
  assert.strictEqual(tagName(emNode), 'em');
  assert.strictEqual(emNode.childNodes.length, 1);
  assert.true(emNode.childNodes[0] instanceof Text);
  assert.strictEqual(emNode.textContent, 'abcdefghi');
}

module('Unit | model | marks-test', function (hooks) {
  const ctx = new ModelTestContext();
  hooks.beforeEach(() => {
    ctx.reset();
    ctx.model.registerMark(highlightMarkSpec);
    ctx.model.registerMark(boldMarkSpec);
    ctx.model.registerMark(italicMarkSpec);
  });
  test('reading works', function (assert) {
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

  test('writing works', function (assert) {
    const textNode = new ModelText('abc');
    const mark = new Mark(boldMarkSpec, {}, textNode);
    textNode.addMark(mark);

    const model = new Model(sinon.createStubInstance(HTMLElement));
    model.registerMark(boldMarkSpec);
    const writer = new HtmlWriter(model);
    const result = writer.write(textNode).viewRoot;
    assert.true(isElement(result));
    assert.strictEqual(tagName(result), 'strong');
    assert.strictEqual(result.childNodes.length, 1);
    assert.strictEqual((result.firstChild as Text).textContent, 'abc');
  });
  test('writing works with multiple marks', function (assert) {
    const textNode = new ModelText('abc');
    textNode.addMark(new Mark(boldMarkSpec, {}, textNode));
    textNode.addMark(new Mark(italicMarkSpec, {}, textNode));

    const model = new Model(sinon.createStubInstance(HTMLElement));
    model.registerMark(boldMarkSpec);
    model.registerMark(italicMarkSpec);
    const writer = new HtmlWriter(model);
    const result = writer.write(textNode).viewRoot;
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
  test('marks are correctly merged and nested: simple case', function (assert) {
    const text = new ModelText('abcdefghi');
    text.addMark(new Mark(italicMarkSpec, {}, text));

    ctx.model.rootModelNode.appendChildren(text);

    const range = new ModelRange(
      ModelPosition.fromInTextNode(text, 3),
      ModelPosition.fromInTextNode(text, 6)
    );

    const op = new MarkOperation(undefined, range, boldMarkSpec, {}, 'add');
    op.execute();
    ctx.model.write();
    assert.strictEqual(ctx.model.rootNode.childNodes.length, 1);
    const emNode = ctx.model.rootNode.childNodes[0];
    assert.strictEqual(tagName(emNode), 'em');
    assert.strictEqual(emNode.childNodes.length, 3);
    assert.strictEqual(tagName(emNode.childNodes[1]), 'strong');
  });
  test('adjacent marks are merged', function (assert) {
    const text = new ModelText('abcdefghi');

    ctx.model.rootModelNode.appendChildren(text);

    const range1 = new ModelRange(
      ModelPosition.fromInTextNode(text, 3),
      ModelPosition.fromInTextNode(text, 6)
    );
    const range2 = new ModelRange(
      ModelPosition.fromInTextNode(text, 6),
      ModelPosition.fromInTextNode(text, 9)
    );

    const op1 = new MarkOperation(undefined, range1, boldMarkSpec, {}, 'add');
    const op2 = new MarkOperation(undefined, range2, boldMarkSpec, {}, 'add');
    op1.execute();
    op2.execute();
    ctx.model.write();
    assert.strictEqual(ctx.model.rootNode.childNodes.length, 2);
    const boldNode = ctx.model.rootNode.childNodes[1];
    assert.strictEqual(tagName(boldNode), 'strong');
    assert.strictEqual(boldNode.childNodes.length, 1);
    assert.strictEqual(boldNode.childNodes[0].textContent, 'defghi');
  });
  test('mark toggling on beginning of text works with different nested marks', function (assert) {
    assert.expect(5);
    testMarkToggling(assert, 0, 3, ctx.model);
  });
  test('mark toggling on middle of text works with different nested marks', function (assert) {
    assert.expect(5);
    testMarkToggling(assert, 3, 6, ctx.model);
  });
  test('mark toggling on end of text works with different nested marks', function (assert) {
    assert.expect(5);
    testMarkToggling(assert, 6, 9, ctx.model);
  });
  test('reading highlights works', function (assert) {
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
    assert.true(
      result.hasMarkName('highlighted'),
      `Marks: ${JSON.stringify(result.marks)}`
    );
  });
  test("reading non-highlight spans doesn't read highlight marks", function (assert) {
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
  test('hashset', function (assert) {
    const set = new HashSet({
      hashFunc: (item) => item.name,
      init: [{ name: 'test1' }, { name: 'test2' }],
    });

    set.deleteHash('test2');
    assert.strictEqual(set.size, 1);
  });
});
