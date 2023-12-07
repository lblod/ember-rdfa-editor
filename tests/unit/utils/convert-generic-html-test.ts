import { module, test } from 'qunit';
import { oneLineTrim } from 'common-tags';
import sinon from 'sinon';
import { EditorState } from 'prosemirror-state';
import { Schema } from 'prosemirror-model';

import { convertGenericHtml } from '@lblod/ember-rdfa-editor/utils/_private/ce/paste-handler-func';
import HTMLInputParser from '@lblod/ember-rdfa-editor/utils/_private/html-input-parser';
import { SayView } from '@lblod/ember-rdfa-editor';
import { docWithConfig, paragraph, text } from '@lblod/ember-rdfa-editor/nodes';

const editorContainerMock = document.createElement('div');
sinon.stub(editorContainerMock, 'clientWidth').get(() => 800);

const editorView = new SayView(document.createElement('div'), {
  state: EditorState.create({
    schema: new Schema({
      nodes: {
        doc: docWithConfig({
          defaultLanguage: 'nl-BE',
        }),
        paragraph,
        text,
      },
    }),
  }),
});

sinon.stub(editorView, 'dom').get(() => editorContainerMock);

module('Utils | CS | paste-handler | convertGenericHtml', function () {
  test('It should not change simple html', function (assert) {
    const expectedHtml = oneLineTrim`<span>Lorem Ipsum</span>`;
    const inputParser = new HTMLInputParser({ editorView });
    const htmlContent = oneLineTrim`
            <!--StartFragment--><span>Lorem Ipsum</span><!--EndFragment-->
    `;

    const actualHtml = convertGenericHtml(htmlContent, inputParser);
    assert.strictEqual(actualHtml, expectedHtml);
  });

  test('It should not remove inline styles', function (assert) {
    const expectedHtml = oneLineTrim`<span style="color:green">Lorem Ipsum</span>`;
    const inputParser = new HTMLInputParser({ editorView });
    const htmlContent = oneLineTrim`
            <!--StartFragment--><span style="color:green">Lorem Ipsum</span><!--EndFragment-->
    `;

    const actualHtml = convertGenericHtml(htmlContent, inputParser);
    assert.strictEqual(actualHtml, expectedHtml);
  });
  test('It should remove unsafe url schemes', function (assert) {
    const expectedHtml = oneLineTrim`<a style="color:green">Lorem Ipsum</a>`;
    const inputParser = new HTMLInputParser({ editorView });
    const htmlContent = oneLineTrim`<a href="javascript:console.log('this should not work')" style="color:green">Lorem Ipsum</a>`;

    const actualHtml = convertGenericHtml(htmlContent, inputParser);
    assert.strictEqual(actualHtml, expectedHtml);
  });

  test('It should remove src tags', function (assert) {
    const expectedHtml = oneLineTrim`console.log('test')`;
    const inputParser = new HTMLInputParser({ editorView });
    const htmlContent = oneLineTrim`<src>console.log('test')</src>`;

    const actualHtml = convertGenericHtml(htmlContent, inputParser);
    assert.strictEqual(actualHtml, expectedHtml);
  });
});
