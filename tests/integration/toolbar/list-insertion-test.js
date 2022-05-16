import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import type from '../util/type-helper';

module.skip('Integration | Toolbar | list-insertion', function (hooks) {
  setupRenderingTest(hooks);

  test('unordered list button inserts a list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');

    assert.strictEqual(editor.firstElementChild.tagName, 'UL');
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
  });

  test('ordered list button inserts a list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');

    assert.strictEqual(editor.firstElementChild.tagName, 'OL');
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
  });

  test('enter inserts another list item in an unordered list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'second test');

    assert.strictEqual(editor.firstElementChild.tagName, 'UL');
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 2);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
    const lastLi = list.lastElementChild;
    assert.strictEqual(lastLi.tagName, 'LI');
    assert.true(lastLi.textContent.includes('second test'));
  });

  test('enter inserts another list item in an ordered list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'second test');

    assert.strictEqual(editor.firstElementChild.tagName, 'OL');
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 2);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
    const lastLi = list.lastElementChild;
    assert.strictEqual(lastLi.tagName, 'LI');
    assert.true(lastLi.textContent.includes('second test'));
  });

  test('insert indentation insert another level of unordered list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');

    assert.strictEqual(editor.firstElementChild.tagName, 'UL');
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
    assert.strictEqual(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.strictEqual(innerList.tagName, 'UL');
    assert.strictEqual(innerList.childElementCount, '1');
    const innerLi = innerList.firstElementChild;
    assert.true(innerLi.textContent.includes('second test'));
  });

  test('insert indentation insert another level of ordered list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');

    assert.strictEqual(editor.firstElementChild.tagName, 'OL');
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
    assert.strictEqual(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.strictEqual(innerList.tagName, 'OL');
    assert.strictEqual(innerList.childElementCount, '1');
    const innerLi = innerList.firstElementChild;
    assert.true(innerLi.textContent.includes('second test'));
  });

  test('remove indentation removes a level of unordered list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-unindent"]');
    await type('div[contenteditable]', 'third test');

    assert.strictEqual(editor.firstElementChild.tagName, 'UL');
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 2);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
    assert.strictEqual(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.strictEqual(innerList.tagName, 'UL');
    assert.strictEqual(innerList.childElementCount, '1');
    const innerLi = innerList.firstElementChild;
    assert.true(innerLi.textContent.includes('second test'));
    const lastLi = list.lastElementChild;
    assert.strictEqual(lastLi.tagName, 'LI');
    assert.true(lastLi.textContent.includes('third test'));
  });

  test('remove indentation removes a level of ordered list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-unindent"]');
    await type('div[contenteditable]', 'third test');

    assert.strictEqual(editor.firstElementChild.tagName, 'OL');
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 2);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
    assert.strictEqual(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.strictEqual(innerList.tagName, 'OL');
    assert.strictEqual(innerList.childElementCount, '1');
    const innerLi = innerList.firstElementChild;
    assert.true(innerLi.textContent.includes('second test'));
    const lastLi = list.lastElementChild;
    assert.strictEqual(lastLi.tagName, 'LI');
    assert.true(lastLi.textContent.includes('third test'));
  });

  test('inserting 2 indentations in an unordered list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');

    assert.strictEqual(editor.firstElementChild.tagName, 'UL');
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
    assert.strictEqual(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.strictEqual(innerList.tagName, 'UL');
    assert.strictEqual(innerList.childElementCount, '1');
    const innerLi = innerList.firstElementChild;
    assert.strictEqual(innerLi.childElementCount, 1);
    const innerInnerList = innerLi.firstElementChild;
    assert.strictEqual(innerInnerList.tagName, 'UL');
    assert.strictEqual(innerInnerList.childElementCount, '1');
    const innnerInnerLi = innerInnerList.firstElementChild;
    assert.strictEqual(innnerInnerLi.tagName, 'LI');
    assert.true(innnerInnerLi.textContent.includes('second test'));
  });

  test('inserting 2 indentations in an ordered list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');

    assert.strictEqual(editor.firstElementChild.tagName, 'OL');
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
    assert.strictEqual(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.strictEqual(innerList.tagName, 'OL');
    assert.strictEqual(innerList.childElementCount, '1');
    const innerLi = innerList.firstElementChild;
    assert.strictEqual(innerLi.childElementCount, 1);
    const innerInnerList = innerLi.firstElementChild;
    assert.strictEqual(innerInnerList.tagName, 'OL');
    assert.strictEqual(innerInnerList.childElementCount, '1');
    const innnerInnerLi = innerInnerList.firstElementChild;
    assert.strictEqual(innnerInnerLi.tagName, 'LI');
    assert.true(innnerInnerLi.textContent.includes('second test'));
  });

  test('enters keep the level of indentiation in an unordered list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'third test');

    assert.strictEqual(editor.firstElementChild.tagName, 'UL');
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
    assert.strictEqual(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.strictEqual(innerList.tagName, 'UL');
    assert.strictEqual(innerList.childElementCount, '2');
    const firstInnerLi = innerList.firstElementChild;
    assert.true(firstInnerLi.textContent.includes('second test'));
    const secondInnerLi = innerList.lastElementChild;
    assert.true(secondInnerLi.textContent.includes('third test'));
  });

  test('enters keep the level of indentiation in an ordered list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'third test');

    assert.strictEqual(editor.firstElementChild.tagName, 'OL');
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
    assert.strictEqual(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.strictEqual(innerList.tagName, 'OL');
    assert.strictEqual(innerList.childElementCount, '2');
    const firstInnerLi = innerList.firstElementChild;
    assert.true(firstInnerLi.textContent.includes('second test'));
    const secondInnerLi = innerList.lastElementChild;
    assert.true(secondInnerLi.textContent.includes('third test'));
  });

  test('insert unindent into a unordered list without indents', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-unindent"]');
    await type('div[contenteditable]', 'second test');

    assert.strictEqual(editor.firstElementChild.tagName, 'UL');
    assert.strictEqual(editor.childElementCount, 2);
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
  });

  test('insert unindent into a ordered list without indents', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-unindent"]');
    await type('div[contenteditable]', 'second test');

    assert.strictEqual(editor.firstElementChild.tagName, 'OL');
    assert.strictEqual(editor.childElementCount, 2);
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
  });

  test('insert unordered list after writting', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await type('div[contenteditable]', 'test');
    await await click('[data-test-button-id="unordered-list"]');

    assert.strictEqual(editor.firstElementChild.tagName, 'UL');
    assert.strictEqual(editor.childElementCount, 1);
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
  });

  test('insert ordered list after writting', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await type('div[contenteditable]', 'test');
    await click('[data-test-button-id="ordered-list"]');

    assert.strictEqual(editor.firstElementChild.tagName, 'OL');
    assert.strictEqual(editor.childElementCount, 1);
    const list = editor.firstElementChild;
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
  });

  test('insert unordered list after writting only affects last line', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'second test');
    await await click('[data-test-button-id="unordered-list"]');

    assert.strictEqual(editor.childElementCount, 2);
    const breakLine = editor.firstElementChild;
    assert.strictEqual(breakLine.tagName, 'BR');
    const list = editor.lastElementChild;
    assert.strictEqual(list.tagName, 'UL');
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
  });

  test('insert ordered list after writting only affects last line', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'second test');
    await await click('[data-test-button-id="ordered-list"]');

    assert.strictEqual(editor.childElementCount, 2);
    const breakLine = editor.firstElementChild;
    assert.strictEqual(breakLine.tagName, 'BR');
    const list = editor.lastElementChild;
    assert.strictEqual(list.tagName, 'OL');
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(firstLi.textContent.includes('test'));
  });

  test('insert unordered list with selection', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('beer<br>pong');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await window.getSelection().selectAllChildren(editor);
    const range = window.getSelection().getRangeAt(0);
    range.setEnd(editor, 3);
    await click('[data-test-button-id="unordered-list"]');
    assert.strictEqual(editor.childElementCount, 2);
    const list = editor.firstElementChild;
    assert.strictEqual(list.tagName, 'UL');
    assert.strictEqual(list.childElementCount, 2);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(list.firstElementChild.textContent.includes('beer'));
    assert.true(list.lastElementChild.textContent.includes('pong'));
  });

  test('insert ordered list with selection', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('beer<br>pong');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await window.getSelection().selectAllChildren(editor);
    const range = window.getSelection().getRangeAt(0);
    range.setEnd(editor, 3);
    await click('[data-test-button-id="ordered-list"]');
    assert.strictEqual(editor.childElementCount, 2);
    const list = editor.firstElementChild;
    assert.strictEqual(list.tagName, 'OL');
    assert.strictEqual(list.childElementCount, 2);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(list.firstElementChild.textContent.includes('beer'));
    assert.true(list.lastElementChild.textContent.includes('pong'));
  });

  test('Case 1', async function (assert) {
    /*
     *   Call unorderedListAction x 1
     *   ```
     *   | a some text
     *   ```
     *   ```
     *   <ul>
     *     <li>| a some text</li>
     *   </ul>
     *   ```
     */
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('a some text');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await window.getSelection().selectAllChildren(editor);
    const range = window.getSelection().getRangeAt(0);
    range.setEnd(editor, 0);
    await click('[data-test-button-id="unordered-list"]');
    assert.strictEqual(editor.childElementCount, 1);
    const list = editor.firstElementChild;
    assert.strictEqual(list.tagName, 'UL');
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(list.firstElementChild.textContent.includes('a some text'));
  });

  test('Case 2', async function (assert) {
    /*
     *   ```
     *   a some <span> t | ext </span>
     *   ```
     *   ```
     *   <ul>
     *     <li>a some <span> t | ext </span></li>
     *   </ul>
     *   ```
     */
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('a some <span> text </span>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await window.getSelection().selectAllChildren(editor);
    const range = window.getSelection().getRangeAt(0);
    range.setStart(editor, 1);
    range.setEnd(editor, 1);
    await click('[data-test-button-id="unordered-list"]');
    assert.strictEqual(editor.childElementCount, 1);
    const list = editor.firstElementChild;
    assert.strictEqual(list.tagName, 'UL');
    assert.strictEqual(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.strictEqual(firstLi.tagName, 'LI');
    assert.true(list.firstElementChild.textContent.includes('a some  text'));
  });

  // TODO: Not OK
  skip('Case 3', async function (assert) {
    /*
     *   Call indent x 1
     *   ```
     *    <ul>
     *     <li> a some <div> block element text | </div>  other text </li>
     *    </ul>
     *   ```
     *   ```
     *    <ul>
     *      <li> a some
     *        <ul>
     *          <li><div> block element text | </div></li>
     *        </ul>
     *        other text
     *      </li>
     *    </ul>
     *   ```
     */
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        '<ul><li> a some <div id="innerId"> block element text </div>  other text </li></ul>'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('#innerId');
    await window.getSelection().selectAllChildren(editor);
    const range = window.getSelection().getRangeAt(0);
    range.setStart(editor, 1);
    range.setEnd(editor, 1);
    await click('[data-test-button-id="insert-indent"]');
    assert.equal(editor.childElementCount, 1);
    const list = editor.firstElementChild;
    assert.equal(list.tagName, 'UL');
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.childElementCount, 3);
    const innerList = firstLi.firstElementChild;
    assert.equal(innerList.tagName, 'UL');
    assert.equal(innerList.childElementCount, 1);
    const innerLi = innerList.firstChild;
    assert.equal(innerLi.tagName, 'LI');
    assert.equal(innerLi.childElementCount, 1);
    assert.equal(
      innerLi.firstElementChild.textContent.includes('block element text'),
      true
    );
  });

  skip('Case 4', async function (assert) {
    /*
     *   Call unorderedListAction x 1
     *    ```
     *    A case |- with br-tag <br> new line. <br> we Will need to refine this.
     *    ```
     *
     *    ```
     *    <ul>
     *      <li>A case |- with br-tag <br> new line. <br> we Will need to refine this.</li>
     *    </ul>
     *    ```
     */
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        'A case - with br-tag <br> new line. <br> we Will need to refine this.'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    var editor = document.querySelector('div[contenteditable]');
    await window.getSelection().selectAllChildren(editor);
    const range = window.getSelection().getRangeAt(0);
    range.setStart(editor, 0);
    range.setEnd(editor, 0);

    await click('[data-test-button-id="unordered-list"]');
    assert.equal(editor.childElementCount, 1);
    const list = editor.firstElementChild;
    assert.equal(list.tagName, 'UL');
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(
      list.firstElementChild.textContent.includes(
        'A case - with br-tag  new line.  we Will need to refine this.'
      ),
      true
    );
  });

  // TODO: Not OK yet
  skip('Case 6', async function (assert) {
    /*
     *   Call unorderedListAction or unindent x 1
     *   ```
     *   <ul>
     *     <li> The first </li>
     *     <li>| a some text</li>
     *     <li> the last </li>
     *   </ul>
     *   ```
     *    ```
     *   <ul>
     *    <li> The first </li>
     *   </ul>
     *   | a some text
     *   <ul>
     *     <li> the last </li>
     *   </ul>
     *    ```
     */
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        '<ul><li> The first </li><li id="innerLi"> a some text </li><li> the last </li></ul>'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    const innerLi = document.querySelector('#innerLi');
    await window.getSelection().selectAllChildren(innerLi);
    const range = window.getSelection().getRangeAt(0);
    range.setStart(innerLi, 1);
    range.setEnd(innerLi, 1);
    const editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="insert-unindent"]');
    assert.equal(editor.childElementCount, 3);
    const firstList = editor.firstElementChild;
    assert.equal(firstList.tagName, 'UL');
    assert.equal(firstList.childElementCount, 1);
    const firstLi = firstList.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes(' The first '), true);
    const inBetweenElement = editor.childNodes[1];
    assert.equal(inBetweenElement.textContent.includes(' a some text '), true);
    const secondList = editor.childNodes[2];
    assert.equal(secondList.tagName, 'UL');
    assert.equal(secondList.childElementCount, 1);
    const secondLi = secondList.firstElementChild;
    assert.equal(secondLi.tagName, 'LI');
    assert.equal(secondLi.textContent.includes(' the last '), true);
  });

  test('Case 7', async function (assert) {
    /*
     *   Call unorderedListAction or unindent x 1
     *   ```
     *   <ul>
     *     <li>| a some text</li>
     *   </ul>
     *   ```
     *
     *    ```
     *    a some <span> t | ext </span>
     *    ```
     */
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('<ul><li id="innerLi">a some text</li></ul>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    const innerLi = document.querySelector('#innerLi');
    await window.getSelection().selectAllChildren(innerLi);
    const range = window.getSelection().getRangeAt(0);
    range.setStart(innerLi, 1);
    range.setEnd(innerLi, 1);
    const editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="insert-unindent"]');
    assert.true(editor.textContent.includes('a some text'));
  });

  //TODO: even though this is the intende behavoir, it feels strange
  test('Case 8', async function (assert) {
    /*
     *   Call unorderedListAction or unindent x 1
     *   ```
     *    <ul>
     *     <li> a | some <div> block element text </div>  other text </li>
     *    </ul>
     *   ```
     *   ```
     *    <ul>
     *     <li> <div> block element text </div>  other text </li>
     *    </ul>
     *    a | some
     *   ```
     */
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        '<ul><li id="innerLi"> a some <div> block element text </div>  other text </li></ul>'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const innerLi = document.querySelector('#innerLi');
    await window.getSelection().selectAllChildren(innerLi);
    const selection = window.getSelection();
    selection.setBaseAndExtent(
      innerLi.childNodes[0],
      0,
      innerLi.childNodes[0],
      0
    );
    const editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="insert-unindent"]');
    assert.true(editor.textContent.includes('a some '));
    const list = editor.childNodes[2];
    assert.strictEqual(list.tagName, 'UL');
    assert.strictEqual(list.childElementCount, 1);
    const listElement = list.firstElementChild;
    assert.strictEqual(listElement.tagName, 'LI');
    assert.strictEqual(listElement.childElementCount, 1);
    assert.true(
      listElement.textContent.includes('block element text  other text')
    );
  });

  // TODO: Not OK yet
  skip('Case 9', async function (assert) {
    /*
     *   Call unorderedListAction or unindent x 1
     *   ```
     *    <ul>
     *      <li> item 1</li>
     *     <li>
     *       <ul>
     *          <li> subitem 1</li>
     *          <li> subitem | 2 </li>
     *          <li> subitem 3</li>
     *       </ul>
     *     </li>
     *     <li> item 2</li>
     *    </ul>
     *   ```
     *   ```
     *    <ul>
     *      <li> item 1</li>
     *     <li>
     *       <ul>
     *          <li> subitem 1</li>
     *       </ul>
     *     </li>
     *     <li> subitem | 2 </li>
     *     <li>
     *       <ul>
     *          <li> subitem 3</li>
     *       </ul>
     *     </li>
     *     <li> item 2</li>
     *    </ul>
     *   ```
     */
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        '<ul><li> item 1</li><li><ul><li> subitem 1</li><li id="innerLi"> subitem 2 </li><li> subitem 3</li></ul></li><li> item 2</li></ul>'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    const innerLi = document.querySelector('#innerLi');
    await window.getSelection().selectAllChildren(innerLi);
    const range = window.getSelection().getRangeAt(0);
    range.setStart(innerLi, 0);
    range.setEnd(innerLi, 0);
    const editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="insert-unindent"]');
    const list = editor.firstChild;
    assert.equal(list.tagName, 'UL');
    assert.equal(list.childElementCount, 5);
    const secondElement = list.childNodes[1];
    assert.equal(secondElement.tagName, 'LI');
    assert.equal(secondElement.childElementCount, 1);
    const innerListOnSecondElement = secondElement.firstChild;
    assert.equal(innerListOnSecondElement.tagName, 'UL');
    assert.equal(innerListOnSecondElement.childElementCount, 1);
    const listItemOnInnerListOnSecondElement =
      innerListOnSecondElement.firstChild;
    assert.equal(listItemOnInnerListOnSecondElement.tagName, 'LI');
    assert.equal(listItemOnInnerListOnSecondElement.childElementCount, 1);
    assert.equal(
      listItemOnInnerListOnSecondElement.textContent.includes(' subitem 1'),
      true
    );
    const thirdElement = list.childNodes[2];
    assert.equal(thirdElement.tagName, 'LI');
    assert.equal(thirdElement.childElementCount, 1);
    assert.equal(thirdElement.textContent.includes(' subitem 2 '), true);
    const fourthElement = list.childNodes[3];
    assert.equal(fourthElement.tagName, 'LI');
    assert.equal(fourthElement.childElementCount, 1);
    const innerListOnFourthElement = fourthElement.firstChild;
    assert.equal(innerListOnFourthElement.tagName, 'UL');
    assert.equal(innerListOnFourthElement.childElementCount, 1);
    const listItemOnInnerListOnFourthElement =
      innerListOnFourthElement.firstChild;
    assert.equal(listItemOnInnerListOnFourthElement.tagName, 'LI');
    assert.equal(listItemOnInnerListOnFourthElement.childElementCount, 1);
    assert.equal(
      listItemOnInnerListOnFourthElement.textContent.includes(' subitem 3'),
      true
    );
  });

  // TODO: Not OK yet
  skip('Case 10', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        '<ul><li> item 1</li><li><ul><li> subitem 1</li><li><div id="innerLi"> subitem 2 </div></li><li> subitem 3</li></ul></li><li> item 2</li></ul>'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    const innerLi = document.querySelector('#innerLi');
    await window.getSelection().selectAllChildren(innerLi);
    const range = window.getSelection().getRangeAt(0);
    range.setStart(innerLi, 0);
    range.setEnd(innerLi, 0);
    const editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="insert-unindent"]');
    const list = editor.firstChild;
    assert.equal(list.tagName, 'UL');
    assert.equal(list.childElementCount, 5);
    const secondElement = list.childNodes[1];
    assert.equal(secondElement.tagName, 'LI');
    assert.equal(secondElement.childElementCount, 1);
    const innerListOnSecondElement = secondElement.firstChild;
    assert.equal(innerListOnSecondElement.tagName, 'UL');
    assert.equal(innerListOnSecondElement.childElementCount, 1);
    const listItemOnInnerListOnSecondElement =
      innerListOnSecondElement.firstChild;
    assert.equal(listItemOnInnerListOnSecondElement.tagName, 'LI');
    assert.equal(listItemOnInnerListOnSecondElement.childElementCount, 1);
    assert.equal(
      listItemOnInnerListOnSecondElement.textContent.includes(' subitem 1'),
      true
    );
    const thirdElement = list.childNodes[2];
    assert.equal(thirdElement.tagName, 'LI');
    assert.equal(thirdElement.childElementCount, 1);
    assert.equal(thirdElement.textContent.includes(' subitem 2 '), true);
    const fourthElement = list.childNodes[3];
    assert.equal(fourthElement.tagName, 'LI');
    assert.equal(fourthElement.childElementCount, 1);
    const innerListOnFourthElement = fourthElement.firstChild;
    assert.equal(innerListOnFourthElement.tagName, 'UL');
    assert.equal(innerListOnFourthElement.childElementCount, 1);
    const listItemOnInnerListOnFourthElement =
      innerListOnFourthElement.firstChild;
    assert.equal(listItemOnInnerListOnFourthElement.tagName, 'LI');
    assert.equal(listItemOnInnerListOnFourthElement.childElementCount, 1);
    assert.equal(
      listItemOnInnerListOnFourthElement.textContent.includes(' subitem 3'),
      true
    );
  });

  test('Case 11', async function (assert) {
    /*
     *   Call unorderedListAction x 1
     *
     *   ```
     *   <ul>
     *     <li> The first </li>
     *     <li>| a some text</li>
     *     <li> the last </li>
     *   </ul>
     *   ```
     *
     *   ```
     *   <ol>
     *     <li> The first </li>
     *     <li>| a some text</li>
     *     <li> the last </li>
     *   </ol>
     *  ```
     */
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        '<ul><li> The first </li><li id="innerLi"> a some text</li><li> the last </li></ul>'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    const innerLi = document.querySelector('#innerLi');
    await window.getSelection().selectAllChildren(innerLi);
    const range = window.getSelection().getRangeAt(0);
    range.setStart(innerLi, 0);
    range.setEnd(innerLi, 0);
    const editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="ordered-list"]');
    const list = editor.firstChild;
    assert.strictEqual(list.tagName, 'OL');
  });

  test('Inserting a list, press undo, insert again, press undo does not remove list content [OL]', async function (assert) {
    //This is a first shot at avoiding a totally unacctable undo behavoir. This test will break once we optimize this
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('beer pong');
    });

    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    const editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="ordered-list"]');

    const list = editor.firstElementChild;
    let li = list.firstElementChild;
    assert.strictEqual(li.textContent, 'beer pong'); //we have a list

    await click('[data-test-button-id="undo-button"]');

    assert.strictEqual(editor.childElementCount, 0);
    assert.strictEqual(editor.textContent, 'beer pong'); //content remains, list is gone

    await click('[data-test-button-id="ordered-list"]');

    li = list.firstElementChild;
    assert.strictEqual(li.textContent, 'beer pong'); //we have a list

    await click('[data-test-button-id="undo-button"]');

    assert.strictEqual(editor.childElementCount, 0);
    assert.true(editor.textContent.includes('beer pong')); //content remains, list is gone (but ugly whitspaces remain)
  });

  test('Inserting a list, press undo, insert again, press undo does not remove list content [UL]', async function (assert) {
    //This is a first shot at avoiding a totally unacceptable undo behavoir. This test will break once we optimize this
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('beer pong');
    });

    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    const editor = document.querySelector('div[contenteditable]');
    await click('[data-test-button-id="ordered-list"]');

    const list = editor.firstElementChild;
    let li = list.firstElementChild;
    assert.strictEqual(li.textContent, 'beer pong'); //we have a list

    await click('[data-test-button-id="undo-button"]');

    assert.strictEqual(editor.childElementCount, 0);
    assert.strictEqual(editor.textContent, 'beer pong'); //content remains, list is gone

    await click('[data-test-button-id="unordered-list"]');

    li = list.firstElementChild;
    assert.strictEqual(li.textContent, 'beer pong'); //we have a list

    await click('[data-test-button-id="undo-button"]');

    assert.strictEqual(editor.childElementCount, 0);
    assert.true(editor.textContent.includes('beer pong')); //content remains, list is gone (but ugly whitspaces remain)
  });

  test('Undo a list item, with previous operation nesting it', async function (assert) {
    //This is a first shot at avoiding a totally unacceptable undo behavoir. This test will break once we optimize this
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        '<ul><li>beer</li><li>pong</li><li>in a bar</li></ul>'
      );
    });

    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    const editor = document.querySelector('div[contenteditable]');
    const li = editor.children[0].children[1];
    const range = window.getSelection().getRangeAt(0);
    range.setStart(li.childNodes[0], 0);
    range.setEnd(li.childNodes[0], 0);

    await type('div[contenteditable]', 'test');
    await click('[data-test-button-id="insert-indent"]');

    const mergedLi = editor.children[0].children[0];
    assert.strictEqual(mergedLi.childElementCount, 1); //sublist ok

    await click('[data-test-button-id="undo-button"]');
    await click('[data-test-button-id="undo-button"]'); //some implentation issue, forces us to trigger twice

    const restoredList = editor.children[0];
    assert.strictEqual(restoredList.childElementCount, 3);
    assert.strictEqual(restoredList.children[1].textContent, 'testpong');
  });
});
