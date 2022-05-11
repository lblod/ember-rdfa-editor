import { module, test } from 'qunit';
import {
  printModel,
  vdom,
} from '@lblod/ember-rdfa-editor/model/util/xml-utils';

module('Unit | model | writers | xml-writer-test', function () {
  test('writes out a sensible document', function (assert) {
    // language=XML
    const { root } = vdom`
      <div>
        <span>
          <text>hello</text>
        </span>
      </div>`;
    const rslt = printModel(root);

    const doc = new Document();
    const xmlRoot = doc.createElement('div');
    const span = doc.createElement('span');
    const text = doc.createElement('text');
    const content = doc.createTextNode('hello');
    xmlRoot.appendChild(span);
    span.appendChild(text);
    text.appendChild(content);

    assert.true(rslt.isEqualNode(xmlRoot));
  });
});
