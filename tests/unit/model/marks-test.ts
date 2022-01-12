import { module, test } from 'qunit';
import {
  domStripped,
  vdom,
} from '@lblod/ember-rdfa-editor/model/util/xml-utils';
import HtmlReader from '@lblod/ember-rdfa-editor/model/readers/html-reader';
import Model from '@lblod/ember-rdfa-editor/model/model';
import sinon from 'sinon';
import {
  BoldMark,
  ItalicMark,
  Mark,
  TagMatch,
} from '@lblod/ember-rdfa-editor/model/mark';
import ModelNode from '@lblod/ember-rdfa-editor/model/model-node';
import { AssertionError } from '@lblod/ember-rdfa-editor/utils/errors';
import ModelText from '@lblod/ember-rdfa-editor/model/model-text';
import HtmlWriter from '@lblod/ember-rdfa-editor/model/writers/html-writer';
import {
  isElement,
  isTextNode,
  tagName,
} from '@lblod/ember-rdfa-editor/utils/dom-helpers';

module('Unit | model | marks-test', (hooks) => {
  test('reading works', (assert) => {
    const html = domStripped`
      <strong>abc</strong>
    `;
    const model = sinon.createStubInstance(Model);
    model.tagMap = new Map<TagMatch, Mark>([['strong', new BoldMark()]]);
    const reader = new HtmlReader(model);
    const result = reader.read(html.body.firstChild!)[0];
    console.log(result);
    if (!ModelNode.isModelText(result)) {
      throw new AssertionError();
    }
    assert.strictEqual(result.content, 'abc');
    assert.true(result.hasMarkName('bold'));
  });

  test('writing works', (assert) => {
    const textNode = new ModelText('abc');
    textNode.marks.add(new BoldMark());

    const model = sinon.createStubInstance(Model);
    model.tagMap = new Map<TagMatch, Mark>([['strong', new BoldMark()]]);
    const writer = new HtmlWriter(model);
    const result = writer.write(textNode);
    assert.true(isElement(result));
    assert.strictEqual(tagName(result), 'strong');
    assert.strictEqual(result.childNodes.length, 1);
    assert.strictEqual((result.firstChild as Text).textContent, 'abc');
  });
  test('writing works with multiple marks', (assert) => {
    const textNode = new ModelText('abc');
    textNode.marks.add(new BoldMark());
    textNode.marks.add(new ItalicMark());

    const model = sinon.createStubInstance(Model);
    model.tagMap = new Map<TagMatch, Mark>([
      ['strong', new BoldMark()],
      ['em', new ItalicMark()],
    ]);
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
});
