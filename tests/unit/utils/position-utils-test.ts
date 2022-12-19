import { module, test } from 'qunit';
import TEST_SCHEMA from 'dummy/tests/test-utils';
import { nodesBetween } from '@lblod/ember-rdfa-editor/utils/position-utils';

module('Unit | utils | position-utils | nodes-between', function () {
  // Replace this with your real tests.
  test('Simple document', function (assert) {
    const schema = TEST_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('paragraph', null, [
        schema.text('abc'),
        schema.node('inline_rdfa', null, [schema.text('def')]),
        schema.text('ghi'),
      ]),
    ]);
    const start = doc.resolve(0);
    const iterator = nodesBetween(start);

    const values = [...iterator];
    assert.strictEqual(values.length, 5);

    assert.strictEqual(values[0].node.type.name, 'paragraph');
    assert.strictEqual(values[0].pos, 0);

    assert.strictEqual(values[1].node.text, 'abc');
    assert.strictEqual(values[1].pos, 1);

    assert.strictEqual(values[2].node.type.name, 'inline_rdfa');
    assert.strictEqual(values[2].pos, 4);

    assert.strictEqual(values[3].node.text, 'def');
    assert.strictEqual(values[3].pos, 5);

    assert.strictEqual(values[4].node.text, 'ghi');
    assert.strictEqual(values[4].pos, 9);
  });
  test('Simple document - reverse', function (assert) {
    const schema = TEST_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('paragraph', null, [
        schema.text('abc'),
        schema.node('inline_rdfa', null, [schema.text('def')]),
        schema.text('ghi'),
      ]),
    ]);
    const start = doc.resolve(doc.content.size);
    const iterator = nodesBetween(start, true, true);

    const values = [...iterator];
    assert.strictEqual(values.length, 5);

    assert.strictEqual(values[0].node.text, 'ghi');
    assert.strictEqual(values[0].pos, 9);

    assert.strictEqual(values[1].node.text, 'def');
    assert.strictEqual(values[1].pos, 5);

    assert.strictEqual(values[2].node.type.name, 'inline_rdfa');
    assert.strictEqual(values[2].pos, 4);

    assert.strictEqual(values[3].node.text, 'abc');
    assert.strictEqual(values[3].pos, 1);

    assert.strictEqual(values[4].node.type.name, 'paragraph');
    assert.strictEqual(values[4].pos, 0);
  });

  test('Simple document with text condition', function (assert) {
    const schema = TEST_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('paragraph', null, [
        schema.text('abc'),
        schema.node('inline_rdfa', null, [schema.text('def')]),
        schema.text('ghi'),
      ]),
    ]);
    const start = doc.resolve(0);
    const iterator = nodesBetween(
      start,
      true,
      false,
      ({ node }) => node.isText
    );

    const values = [...iterator];
    assert.strictEqual(values.length, 3);

    assert.strictEqual(values[0].node.text, 'abc');
    assert.strictEqual(values[0].pos, 1);

    assert.strictEqual(values[1].node.text, 'def');
    assert.strictEqual(values[1].pos, 5);

    assert.strictEqual(values[2].node.text, 'ghi');
    assert.strictEqual(values[2].pos, 9);
  });
  test('Simple document in reverse with text condition', function (assert) {
    const schema = TEST_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('paragraph', null, [
        schema.text('abc'),
        schema.node('inline_rdfa', null, [schema.text('def')]),
        schema.text('ghi'),
      ]),
    ]);
    const start = doc.resolve(doc.content.size);
    const iterator = nodesBetween(start, true, true, ({ node }) => node.isText);

    const values = [...iterator];
    assert.strictEqual(values.length, 3);
    assert.strictEqual(values[2].node.text, 'abc');
    assert.strictEqual(values[2].pos, 1);

    assert.strictEqual(values[1].node.text, 'def');
    assert.strictEqual(values[1].pos, 5);

    assert.strictEqual(values[0].node.text, 'ghi');
    assert.strictEqual(values[0].pos, 9);
  });
  test('Simple document with start inside text node', function (assert) {
    const schema = TEST_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('paragraph', null, [
        schema.text('abc'),
        schema.node('inline_rdfa', null, [schema.text('def')]),
        schema.text('ghi'),
      ]),
    ]);
    const start = doc.resolve(2);
    const iterator = nodesBetween(start);

    const values = [...iterator];
    assert.strictEqual(values.length, 4);
    assert.strictEqual(values[0].node.text, 'abc');
    assert.strictEqual(values[0].pos, 1);

    assert.strictEqual(values[1].node.type.name, 'inline_rdfa');
    assert.strictEqual(values[1].pos, 4);

    assert.strictEqual(values[2].node.text, 'def');
    assert.strictEqual(values[2].pos, 5);

    assert.strictEqual(values[3].node.text, 'ghi');
    assert.strictEqual(values[3].pos, 9);
  });
  test('Simple document with start inside text node - reverse', function (assert) {
    const schema = TEST_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('paragraph', null, [
        schema.text('abc'),
        schema.node('inline_rdfa', null, [schema.text('def')]),
        schema.text('ghi'),
      ]),
    ]);
    const start = doc.resolve(10);
    const iterator = nodesBetween(start, true, true);

    const values = [...iterator];
    assert.strictEqual(values.length, 5);
    assert.strictEqual(values[0].node.text, 'ghi');
    assert.strictEqual(values[0].pos, 9);

    assert.strictEqual(values[1].node.text, 'def');
    assert.strictEqual(values[1].pos, 5);

    assert.strictEqual(values[2].node.type.name, 'inline_rdfa');
    assert.strictEqual(values[2].pos, 4);

    assert.strictEqual(values[3].node.text, 'abc');
    assert.strictEqual(values[3].pos, 1);

    assert.strictEqual(values[4].node.type.name, 'paragraph');
    assert.strictEqual(values[4].pos, 0);
  });
});
