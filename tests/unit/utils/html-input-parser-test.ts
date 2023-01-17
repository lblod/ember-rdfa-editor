import HtmlInputParser from '@lblod/ember-rdfa-editor/utils/html-input-parser';
import { module, test } from 'qunit';
import {
  NON_BREAKING_SPACE,
  INVISIBLE_SPACE,
} from '@lblod/ember-rdfa-editor/utils/constants';

module('Unit | Utility | html-input-parser', function () {
  // Replace this with your real tests.
  test('it correctly replaces non breaking spaces', function (assert) {
    const parser = new HtmlInputParser({});
    const html = `${NON_BREAKING_SPACE}${NON_BREAKING_SPACE}`;
    const result = parser.cleanupHTML(html);
    assert.strictEqual(result, '  ');
  });

  test('it correctly removes invisible spaces', function (assert) {
    const parser = new HtmlInputParser({});
    const html = `${INVISIBLE_SPACE}${INVISIBLE_SPACE}`;
    const result = parser.cleanupHTML(html);
    console.log(result.charCodeAt(1));
    assert.strictEqual(result, '');
  });
});
