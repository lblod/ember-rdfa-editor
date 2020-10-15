import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import type from '../util/type-helper';

module('Integration | Toolbar | list-insertion', function(hooks) {
  setupRenderingTest(hooks);

  test('unordered list button inserts a list', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');

    assert.equal(editor.firstElementChild.tagName, 'UL');
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
  });

  test('ordered list button inserts a list', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');

    assert.equal(editor.firstElementChild.tagName, 'OL');
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
  });

  test('enter inserts another list item in an unordered list', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'second test');

    assert.equal(editor.firstElementChild.tagName, 'UL');
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 2);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
    const lastLi = list.lastElementChild;
    assert.equal(lastLi.tagName, 'LI');
    assert.equal(lastLi.textContent.includes('second test'), true);
  });

  test('enter inserts another list item in an ordered list', async function(assert) {
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
    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'second test');

    assert.equal(editor.firstElementChild.tagName, 'OL');
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 2);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
    const lastLi = list.lastElementChild;
    assert.equal(lastLi.tagName, 'LI');
    assert.equal(lastLi.textContent.includes('second test'), true);
  });

  test('insert indentation insert another level of unordered list', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');

    assert.equal(editor.firstElementChild.tagName, 'UL');
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
    assert.equal(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.equal(innerList.tagName, 'UL');
    assert.equal(innerList.childElementCount, '1');
    const innerLi = innerList.firstElementChild;
    assert.equal(innerLi.textContent.includes('second test'), true);
  });

  test('insert indentation insert another level of ordered list', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');

    assert.equal(editor.firstElementChild.tagName, 'OL');
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
    assert.equal(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.equal(innerList.tagName, 'OL');
    assert.equal(innerList.childElementCount, '1');
    const innerLi = innerList.firstElementChild;
    assert.equal(innerLi.textContent.includes('second test'), true);

  });

  test('remove indentation removes a level of unordered list', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-unindent"]');
    await type('div[contenteditable]', 'third test');

    assert.equal(editor.firstElementChild.tagName, 'UL');
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 2);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
    assert.equal(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.equal(innerList.tagName, 'UL');
    assert.equal(innerList.childElementCount, '1');
    const innerLi = innerList.firstElementChild;
    assert.equal(innerLi.textContent.includes('second test'), true);
    const lastLi = list.lastElementChild;
    assert.equal(lastLi.tagName, 'LI');
    assert.equal(lastLi.textContent.includes('third test'), true);

  });

  test('remove indentation removes a level of ordered list', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-unindent"]');
    await type('div[contenteditable]', 'third test');

    assert.equal(editor.firstElementChild.tagName, 'OL');
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 2);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
    assert.equal(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.equal(innerList.tagName, 'OL');
    assert.equal(innerList.childElementCount, '1');
    const innerLi = innerList.firstElementChild;
    assert.equal(innerLi.textContent.includes('second test'), true);
    const lastLi = list.lastElementChild;
    assert.equal(lastLi.tagName, 'LI');
    assert.equal(lastLi.textContent.includes('third test'), true);
  });

  test('inserting 2 indentations in an unordered list', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');

    assert.equal(editor.firstElementChild.tagName, 'UL');
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
    assert.equal(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.equal(innerList.tagName, 'UL');
    assert.equal(innerList.childElementCount, '1');
    const innerLi = innerList.firstElementChild;
    assert.equal(innerLi.childElementCount, 1);
    const innerInnerList = innerLi.firstElementChild;
    assert.equal(innerInnerList.tagName, 'UL');
    assert.equal(innerInnerList.childElementCount, '1');
    const innnerInnerLi = innerInnerList.firstElementChild;
    assert.equal(innnerInnerLi.tagName, 'LI');
    assert.equal(innnerInnerLi.textContent.includes('second test'), true);
  });

  test('inserting 2 indentations in an ordered list', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');

    assert.equal(editor.firstElementChild.tagName, 'OL');
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
    assert.equal(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.equal(innerList.tagName, 'OL');
    assert.equal(innerList.childElementCount, '1');
    const innerLi = innerList.firstElementChild;
    assert.equal(innerLi.childElementCount, 1);
    const innerInnerList = innerLi.firstElementChild;
    assert.equal(innerInnerList.tagName, 'OL');
    assert.equal(innerInnerList.childElementCount, '1');
    const innnerInnerLi = innerInnerList.firstElementChild;
    assert.equal(innnerInnerLi.tagName, 'LI');
    assert.equal(innnerInnerLi.textContent.includes('second test'), true);
  });

  test('enters keep the level of indentiation in an unordered list', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'third test');

    assert.equal(editor.firstElementChild.tagName, 'UL');
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
    assert.equal(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.equal(innerList.tagName, 'UL');
    assert.equal(innerList.childElementCount, '2');
    const firstInnerLi = innerList.firstElementChild;
    assert.equal(firstInnerLi.textContent.includes('second test'), true);
    const secondInnerLi = innerList.lastElementChild;
    assert.equal(secondInnerLi.textContent.includes('third test'), true);
  });

  test('enters keep the level of indentiation in an ordered list', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'third test');


    assert.equal(editor.firstElementChild.tagName, 'OL');
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
    assert.equal(firstLi.childElementCount, 1);
    const innerList = firstLi.lastElementChild;
    assert.equal(innerList.tagName, 'OL');
    assert.equal(innerList.childElementCount, '2');
    const firstInnerLi = innerList.firstElementChild;
    assert.equal(firstInnerLi.textContent.includes('second test'), true);
    const secondInnerLi = innerList.lastElementChild;
    assert.equal(secondInnerLi.textContent.includes('third test'), true);
  });

  test('insert unindent into a unordered list without indents', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-unindent"]');
    await type('div[contenteditable]', 'second test');

    assert.equal(editor.firstElementChild.tagName, 'UL');
    assert.equal(editor.childElementCount, 2);
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);

  });

  test('insert unindent into a ordered list without indents', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await click('[data-test-button-id="insert-unindent"]');
    await type('div[contenteditable]', 'second test');

    assert.equal(editor.firstElementChild.tagName, 'OL');
    assert.equal(editor.childElementCount, 2);
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
  });

  test('insert unordered list after writting', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await type('div[contenteditable]', 'test');
    await await click('[data-test-button-id="unordered-list"]');

    assert.equal(editor.firstElementChild.tagName, 'UL');
    assert.equal(editor.childElementCount, 1);
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
  });

  test('insert ordered list after writting', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await type('div[contenteditable]', 'test');
    await click('[data-test-button-id="ordered-list"]');

    assert.equal(editor.firstElementChild.tagName, 'OL');
    assert.equal(editor.childElementCount, 1);
    const list = editor.firstElementChild;
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
  });

  test('insert unordered list after writting only affects last line', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'second test');
    await await click('[data-test-button-id="unordered-list"]');

    assert.equal(editor.childElementCount, 2);
    const breakLine = editor.firstElementChild;
    assert.equal(breakLine.tagName, 'BR');
    const list = editor.lastElementChild;
    assert.equal(list.tagName, 'UL');
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
  });

  test('insert ordered list after writting only affects last line', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'second test');
    await await click('[data-test-button-id="ordered-list"]');

    assert.equal(editor.childElementCount, 2);
    const breakLine = editor.firstElementChild;
    assert.equal(breakLine.tagName, 'BR');
    const list = editor.lastElementChild;
    assert.equal(list.tagName, 'OL');
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
  });

  //This shouldn't happen we would want to convert all the selection to a list
  test('insert unordered list with selection', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'second test');
    await window.getSelection().selectAllChildren(editor);
    await await click('[data-test-button-id="unordered-list"]');

    assert.equal(editor.childElementCount, 2);
    const breakLine = editor.firstElementChild;
    assert.equal(breakLine.tagName, 'BR');
    const list = editor.lastElementChild;
    assert.equal(list.tagName, 'UL');
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
  });

  //This shouldn't happen we would want to convert all the selection to a list
  test('insert ordered list with selection', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'second test');
    await window.getSelection().selectAllChildren(editor);
    await await click('[data-test-button-id="ordered-list"]');

    assert.equal(editor.childElementCount, 2);
    const breakLine = editor.firstElementChild;
    assert.equal(breakLine.tagName, 'BR');
    const list = editor.lastElementChild;
    assert.equal(list.tagName, 'OL');
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(firstLi.textContent.includes('test'), true);
  });

});
