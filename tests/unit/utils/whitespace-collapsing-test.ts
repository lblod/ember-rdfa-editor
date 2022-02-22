import { module, test } from 'qunit';
import {
  preWrapToNormalWhiteSpace,
  normalToPreWrapWhiteSpace,
} from '@lblod/ember-rdfa-editor/utils/whitespace-collapsing';
import { NON_BREAKING_SPACE } from '@lblod/ember-rdfa-editor/model/util/constants';

module('Unit | utils | whitespace-collapsing | pre-wrap-to-normal ', () => {
  test('properly replaces spaces with non breaking ones', function (assert) {
    const editorText = 'I like two spaces after my sentence.  See?';
    const result = preWrapToNormalWhiteSpace(editorText);
    assert.strictEqual(
      result,
      `I like two spaces after my sentence.${NON_BREAKING_SPACE} See?`
    );
  });
  test('replaces the space with a nbsp if its at the end of the string', function (assert) {
    const editorText = 'would you look at that ';
    const result = preWrapToNormalWhiteSpace(editorText);
    assert.strictEqual(result, `would you look at that${NON_BREAKING_SPACE}`);
  });
  test('properly handles a text node only consisting of spaces', function (assert) {
    const editorText = '              ';
    const result = preWrapToNormalWhiteSpace(editorText);
    assert.strictEqual(
      result,
      `${NON_BREAKING_SPACE} ${NON_BREAKING_SPACE} ${NON_BREAKING_SPACE} ${NON_BREAKING_SPACE} ${NON_BREAKING_SPACE} ${NON_BREAKING_SPACE} ${NON_BREAKING_SPACE}${NON_BREAKING_SPACE}`
    );
  });
});

module('Unit | utils | whitespace-collapsing | normal-to-pre-wrap', () => {
  test('properly collapses spaces', function (assert) {
    const inputText = '            my title';
    const result = normalToPreWrapWhiteSpace(inputText);
    assert.strictEqual(result, 'my title');
  });

  test('removes linebreaks', function (assert) {
    const inputText = 'line one\nline two\nline 3';
    const result = normalToPreWrapWhiteSpace(inputText);
    assert.strictEqual(result, 'line one line two line 3');
  });
});
