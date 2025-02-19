import { module, skip } from 'qunit';
import { SAMPLE_SCHEMA } from 'test-app/tests/helpers/prosemirror';

module('ProseMirror | marks', function () {
  skip('Adjacent styling marks should be merged', function (assert) {
    const schema = SAMPLE_SCHEMA;
    const doc = schema.node('doc', {}, [
      schema.node('paragraph', null, [
        schema.text('ab', [schema.marks.strong.create()]),
        schema.text('cd', [schema.marks.strong.create()]),
      ]),
    ]);
    assert.strictEqual(doc.firstChild?.childCount, 1);
    assert.strictEqual(doc.firstChild?.firstChild?.textContent, 'abcd');
  });
  // skip('Adjacent rdfa marks (with different guids) should not be merged', function (assert) {
  //   const schema = SAMPLE_SCHEMA;
  //   const doc = schema.node('doc', {}, [
  //     schema.node('paragraph', null, [
  //       schema.text('ab', [schema.marks.inline_rdfa.create({ _guid: '1' })]),
  //       schema.text('cd', [schema.marks.inline_rdfa.create({ _guid: '2' })]),
  //     ]),
  //   ]);
  //   const paragraph = unwrap(doc.firstChild);
  //   assert.strictEqual(paragraph.childCount, 2);
  //   assert.strictEqual(paragraph.child(0).textContent, 'ab');
  //   assert.strictEqual(paragraph.child(1).textContent, 'cd');
  //   const html = DOMSerializer.fromSchema(schema).serializeNode(doc);
  //   const p_element = unwrap(html.firstChild);
  //   assert.strictEqual(p_element.childNodes.length, 2);
  //   assert.strictEqual(p_element.childNodes[0].textContent, 'ab');
  //   assert.strictEqual(p_element.childNodes[1].textContent, 'cd');
  // });
  // skip('Adjacent rdfa marks (with identical guids) should be merged', function (assert) {
  //   const schema = SAMPLE_SCHEMA;
  //   const doc = schema.node('doc', {}, [
  //     schema.node('paragraph', null, [
  //       schema.text('ab', [schema.marks.inline_rdfa.create({ _guid: '1' })]),
  //       schema.text('cd', [schema.marks.inline_rdfa.create({ _guid: '1' })]),
  //     ]),
  //   ]);
  //   const paragraph = unwrap(doc.firstChild);
  //   assert.strictEqual(paragraph.childCount, 1);
  //   assert.strictEqual(paragraph.child(0).textContent, 'abcd');
  //   const html = DOMSerializer.fromSchema(schema).serializeNode(doc);
  //   const p_element = unwrap(html.firstChild);
  //   assert.strictEqual(p_element.childNodes.length, 1);
  //   assert.strictEqual(p_element.childNodes[0].textContent, 'abcd');
  // });
});
