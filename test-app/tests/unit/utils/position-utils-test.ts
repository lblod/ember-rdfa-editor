import { module, test } from 'qunit';
import TEST_SCHEMA from '../../test-utils';
import { findNodes } from '@lblod/ember-rdfa-editor/utils/_private/position-utils';

module('Unit | utils | position-utils | get-nodes', function () {
  // Replace this with your real tests.
  test('Simple document', function (assert) {
    const schema = TEST_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('block_rdfa', null, [
        schema.node('paragraph', null, [schema.text('abc')]),
        schema.node('block_rdfa', null, [
          schema.node('paragraph', null, [schema.text('def')]),
        ]),
        schema.node('paragraph', null, [schema.text('ghi')]),
      ]),
    ]);
    const iterator = findNodes({ doc, start: 0 });

    const ranges = [...iterator];
    assert.strictEqual(ranges.length, 8);
    assert.deepEqual(ranges[0], { from: 0, to: 19 });
    assert.deepEqual(ranges[1], { from: 1, to: 6 });
    assert.deepEqual(ranges[2], { from: 2, to: 5 });
    assert.deepEqual(ranges[3], { from: 6, to: 13 });
    assert.deepEqual(ranges[4], { from: 7, to: 12 });
    assert.deepEqual(ranges[5], { from: 8, to: 11 });
    assert.deepEqual(ranges[6], { from: 13, to: 18 });
    assert.deepEqual(ranges[7], { from: 14, to: 17 });
  });
  test('Simple document - reverse', function (assert) {
    const schema = TEST_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('block_rdfa', null, [
        schema.node('paragraph', null, [schema.text('abc')]),
        schema.node('block_rdfa', null, [
          schema.node('paragraph', null, [schema.text('def')]),
        ]),
        schema.node('paragraph', null, [schema.text('ghi')]),
      ]),
    ]);
    const iterator = findNodes({
      doc,
      start: doc.content.size,
      visitParentUpwards: true,
      reverse: true,
    });

    const ranges = [...iterator];

    assert.strictEqual(ranges.length, 8);
    assert.deepEqual(ranges[0], { from: 14, to: 17 });
    assert.deepEqual(ranges[1], { from: 13, to: 18 });
    assert.deepEqual(ranges[2], { from: 8, to: 11 });
    assert.deepEqual(ranges[3], { from: 7, to: 12 });
    assert.deepEqual(ranges[4], { from: 6, to: 13 });
    assert.deepEqual(ranges[5], { from: 2, to: 5 });
    assert.deepEqual(ranges[6], { from: 1, to: 6 });
    assert.deepEqual(ranges[7], { from: 0, to: 19 });
  });

  test('Simple document with text condition', function (assert) {
    const schema = TEST_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('block_rdfa', null, [
        schema.node('paragraph', null, [schema.text('abc')]),
        schema.node('block_rdfa', null, [
          schema.node('paragraph', null, [schema.text('def')]),
        ]),
        schema.node('paragraph', null, [schema.text('ghi')]),
      ]),
    ]);
    const iterator = findNodes({
      doc,
      start: 0,
      visitParentUpwards: true,
      filter: ({ from }) => {
        const node = doc.nodeAt(from);
        return !!node?.isText;
      },
    });

    const ranges = [...iterator];
    assert.strictEqual(ranges.length, 3);

    assert.deepEqual(ranges[0], { from: 2, to: 5 });
    assert.deepEqual(ranges[1], { from: 8, to: 11 });
    assert.deepEqual(ranges[2], { from: 14, to: 17 });
  });
  test('Simple document in reverse with text condition', function (assert) {
    const schema = TEST_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('block_rdfa', null, [
        schema.node('paragraph', null, [schema.text('abc')]),
        schema.node('block_rdfa', null, [
          schema.node('paragraph', null, [schema.text('def')]),
        ]),
        schema.node('paragraph', null, [schema.text('ghi')]),
      ]),
    ]);
    const iterator = findNodes({
      doc,
      start: doc.content.size,
      visitParentUpwards: true,
      reverse: true,
      filter: ({ from }) => {
        const node = doc.nodeAt(from);
        return !!node?.isText;
      },
    });

    const ranges = [...iterator];
    assert.strictEqual(ranges.length, 3);

    assert.deepEqual(ranges[0], { from: 14, to: 17 });
    assert.deepEqual(ranges[1], { from: 8, to: 11 });
    assert.deepEqual(ranges[2], { from: 2, to: 5 });
  });
  test('Simple document with start inside text node', function (assert) {
    const schema = TEST_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('block_rdfa', null, [
        schema.node('paragraph', null, [schema.text('abc')]),
        schema.node('block_rdfa', null, [
          schema.node('paragraph', null, [schema.text('def')]),
        ]),
        schema.node('paragraph', null, [schema.text('ghi')]),
      ]),
    ]);
    const iterator = findNodes({ doc, start: 6 });

    const ranges = [...iterator];
    assert.strictEqual(ranges.length, 5);

    assert.deepEqual(ranges[0], { from: 6, to: 13 });
    assert.deepEqual(ranges[1], { from: 7, to: 12 });
    assert.deepEqual(ranges[2], { from: 8, to: 11 });
    assert.deepEqual(ranges[3], { from: 13, to: 18 });
    assert.deepEqual(ranges[4], { from: 14, to: 17 });
  });
  test('Simple document with start inside text node - reverse', function (assert) {
    const schema = TEST_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('block_rdfa', null, [
        schema.node('paragraph', null, [schema.text('abc')]),
        schema.node('block_rdfa', null, [
          schema.node('paragraph', null, [schema.text('def')]),
        ]),
        schema.node('paragraph', null, [schema.text('ghi')]),
      ]),
    ]);
    const iterator = findNodes({
      doc,
      start: 13,
      reverse: true,
      visitParentUpwards: true,
    });

    const ranges = [...iterator];
    assert.strictEqual(ranges.length, 6);
    assert.deepEqual(ranges[0], { from: 8, to: 11 });
    assert.deepEqual(ranges[1], { from: 7, to: 12 });
    assert.deepEqual(ranges[2], { from: 6, to: 13 });
    assert.deepEqual(ranges[3], { from: 2, to: 5 });
    assert.deepEqual(ranges[4], { from: 1, to: 6 });
    assert.deepEqual(ranges[5], { from: 0, to: 19 });
  });
});
