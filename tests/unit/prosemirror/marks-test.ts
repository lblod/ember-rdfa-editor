import { module, test } from 'qunit';
import TEST_SCHEMA from 'dummy/tests/test-utils';
import { DOMSerializer } from 'prosemirror-model';
import { unwrap } from '@lblod/ember-rdfa-editor/utils/_private/option';

// module('ProseMirror | marks', function () {
//   test('Adjacent styling marks should be merged', function (assert) {
//     const schema = TEST_SCHEMA;
//     const doc = schema.node('doc', {}, [
//       schema.node('paragraph', null, [
//         schema.text('ab', [schema.marks.strong.create()]),
//         schema.text('cd', [schema.marks.strong.create()]),
//       ]),
//     ]);
//     assert.strictEqual(doc.firstChild?.childCount, 1);
//     assert.strictEqual(doc.firstChild?.firstChild?.textContent, 'abcd');
//   });
//   test('Adjacent rdfa marks (with different guids) should not be merged', function (assert) {
//     const schema = TEST_SCHEMA;
//     const doc = schema.node('doc', {}, [
//       schema.node('paragraph', null, [
//         schema.text('ab', [schema.marks.inline_rdfa.create({ _guid: '1' })]),
//         schema.text('cd', [schema.marks.inline_rdfa.create({ _guid: '2' })]),
//       ]),
//     ]);
//     const paragraph = unwrap(doc.firstChild);
//     assert.strictEqual(paragraph.childCount, 2);
//     assert.strictEqual(paragraph.child(0).textContent, 'ab');
//     assert.strictEqual(paragraph.child(1).textContent, 'cd');
//     const html = DOMSerializer.fromSchema(schema).serializeNode(doc);
//     const p_element = unwrap(html.firstChild);
//     assert.strictEqual(p_element.childNodes.length, 2);
//     assert.strictEqual(p_element.childNodes[0].textContent, 'ab');
//     assert.strictEqual(p_element.childNodes[1].textContent, 'cd');
//   });
//   test('Adjacent rdfa marks (with identical guids) should be merged', function (assert) {
//     const schema = TEST_SCHEMA;
//     const doc = schema.node('doc', {}, [
//       schema.node('paragraph', null, [
//         schema.text('ab', [schema.marks.inline_rdfa.create({ _guid: '1' })]),
//         schema.text('cd', [schema.marks.inline_rdfa.create({ _guid: '1' })]),
//       ]),
//     ]);
//     const paragraph = unwrap(doc.firstChild);
//     assert.strictEqual(paragraph.childCount, 1);
//     assert.strictEqual(paragraph.child(0).textContent, 'abcd');
//     const html = DOMSerializer.fromSchema(schema).serializeNode(doc);
//     const p_element = unwrap(html.firstChild);
//     assert.strictEqual(p_element.childNodes.length, 1);
//     assert.strictEqual(p_element.childNodes[0].textContent, 'abcd');
//   });
// });
