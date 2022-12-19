import {module, test} from 'qunit';
import TEST_SCHEMA from 'dummy/tests/test-utils';
import {findNodes} from '@lblod/ember-rdfa-editor/utils/position-utils';

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
    const iterator = findNodes(doc, 0);

    const ranges = [...iterator];
    assert.strictEqual(ranges.length, 5);

    assert.deepEqual(ranges[0], {from: 0, to: 13})
    assert.deepEqual(ranges[1], {from: 1, to: 4})
    assert.deepEqual(ranges[2], {from: 4, to: 9});
    assert.deepEqual(ranges[3], {from: 5, to: 8});
    assert.deepEqual(ranges[4], {from: 9, to: 12});
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
    const iterator = findNodes(doc, doc.content.size, true, true);

    const ranges = [...iterator];

    assert.deepEqual(ranges[4], {from: 0, to: 13})
    assert.deepEqual(ranges[3], {from: 1, to: 4})
    assert.deepEqual(ranges[2], {from: 4, to: 9});
    assert.deepEqual(ranges[1], {from: 5, to: 8});
    assert.deepEqual(ranges[0], {from: 9, to: 12});
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
    const iterator = findNodes(doc, 0, true, false, ({from}) => {
      const node = doc.nodeAt(from);
      return !!(node?.isText);
    });

    const ranges = [...iterator];
    assert.strictEqual(ranges.length, 3);

    assert.deepEqual(ranges[0], {from: 1, to: 4});
    assert.deepEqual(ranges[1], {from: 5, to: 8});
    assert.deepEqual(ranges[2], {from: 9, to: 12});
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
    const iterator = findNodes(doc, doc.content.size, true, true, ({from}) => {
      const node = doc.nodeAt(from);
      return !!(node?.isText);
    });

    const ranges = [...iterator];
    assert.strictEqual(ranges.length, 3);

    assert.deepEqual(ranges[2], {from: 1, to: 4});
    assert.deepEqual(ranges[1], {from: 5, to: 8});
    assert.deepEqual(ranges[0], {from: 9, to: 12});
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
    const iterator = findNodes(doc, 2);

    const ranges = [...iterator];
    assert.strictEqual(ranges.length, 4);

    assert.deepEqual(ranges[0], {from: 1, to: 4});
    assert.deepEqual(ranges[1], {from: 4, to: 9});
    assert.deepEqual(ranges[2], {from: 5, to: 8});
    assert.deepEqual(ranges[3], {from: 9, to: 12});
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
    const iterator = findNodes(doc, 10, true, true);

    const values = [...iterator];
    assert.strictEqual(values.length, 5);
    assert.strictEqual(values[0], { });
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
