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

  test('insert unordered list with selection', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await window.getSelection().selectAllChildren(editor);
    const range = window.getSelection().getRangeAt(0);
    range.setEnd(editor, 3);
    await click('[data-test-button-id="unordered-list"]');
    assert.equal(editor.childElementCount, 2);
    const list = editor.firstElementChild;
    assert.equal(list.tagName, 'UL');
    assert.equal(list.childElementCount, 2);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(list.firstElementChild.textContent.includes('beer'), true);
    assert.equal(list.lastElementChild.textContent.includes('pong'), true);
  });

  test('insert ordered list with selection', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await window.getSelection().selectAllChildren(editor);
    const range = window.getSelection().getRangeAt(0);
    range.setEnd(editor, 3);
    await click('[data-test-button-id="ordered-list"]');
    assert.equal(editor.childElementCount, 2);
    const list = editor.firstElementChild;
    assert.equal(list.tagName, 'OL');
    assert.equal(list.childElementCount, 2);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(list.firstElementChild.textContent.includes('beer'), true);
    assert.equal(list.lastElementChild.textContent.includes('pong'), true);
  });

  // Tests described on ember-rdfa-editor/addon/utils/ce/list-helpers.js

  test('Case 1', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await window.getSelection().selectAllChildren(editor);
    const range = window.getSelection().getRangeAt(0);
    range.setEnd(editor, 0);
    await click('[data-test-button-id="unordered-list"]');
    assert.equal(editor.childElementCount, 1);
    const list = editor.firstElementChild;
    assert.equal(list.tagName, 'UL');
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(list.firstElementChild.textContent.includes('a some text'), true);
  });

  test('Case 2', async function(assert) {
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

    var editor = document.querySelector("div[contenteditable]");
    await window.getSelection().selectAllChildren(editor);
    const range = window.getSelection().getRangeAt(0);
    range.setStart(editor, 1);
    range.setEnd(editor, 1);
    await click('[data-test-button-id="unordered-list"]');
    assert.equal(editor.childElementCount, 1);
    const list = editor.firstElementChild;
    assert.equal(list.tagName, 'UL');
    assert.equal(list.childElementCount, 1);
    const firstLi = list.firstElementChild;
    assert.equal(firstLi.tagName, 'LI');
    assert.equal(list.firstElementChild.textContent.includes('a some  text'), true);
  });

  // TODO: Not OK yet
  // test('Case 3', async function(assert) {
  //   this.set('rdfaEditorInit', (editor) => {
  //     editor.setHtmlContent('<ul><li> a some <div id="innerId"> block element text </div>  other text </li></ul>');
  //   });
  //   await render(hbs`<Rdfa::RdfaEditor
  //     @rdfaEditorInit={{action rdfaEditorInit}}
  //     @profile="default"
  //     class="rdfa-playground"
  //     @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
  //     @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
  //   />`);

  //   var editor = document.querySelector("#innerId");
  //   await window.getSelection().selectAllChildren(editor);
  //   const range = window.getSelection().getRangeAt(0);
  //   range.setStart(editor, 1);
  //   range.setEnd(editor, 1);
  //   await click('[data-test-button-id="insert-indent"]');
  //   assert.equal(editor.childElementCount, 1);
  //   console.log(document.querySelector("div[contenteditable]"));
  //   const list = editor.firstElementChild;
  //   assert.equal(list.tagName, 'UL');
  //   assert.equal(list.childElementCount, 1);
  //   const firstLi = list.firstElementChild;
  //   assert.equal(firstLi.tagName, 'LI');
  //   assert.equal(firstLi.childElementCount, 3);
  //   const innerList = firstLi.firstElementChild;
  //   assert.equal(innerList.tagName, 'UL');
  //   assert.equal(innerList.childElementCount, 1);
  //   const innerLi = innerList.firstChild;
  //   assert.equal(innerLi.tagName, 'LI');
  //   assert.equal(innerLi.childElementCount, 1);
  //   assert.equal(innerLi.firstElementChild.textContent.includes('block element text'), true);
  // });

  // TODO: Not OK yet
  // test('Case 4', async function(assert) {
  //   this.set('rdfaEditorInit', (editor) => {
  //     editor.setHtmlContent('A case - with br-tag <br> new line. <br> we Will need to refine this.');
  //   });
  //   await render(hbs`<Rdfa::RdfaEditor
  //     @rdfaEditorInit={{action rdfaEditorInit}}
  //     @profile="default"
  //     class="rdfa-playground"
  //     @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
  //     @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
  //   />`);

  //   var editor = document.querySelector("div[contenteditable]");
  //   await window.getSelection().selectAllChildren(editor);
  //   const range = window.getSelection().getRangeAt(0);
  //   range.setStart(editor, 0);
  //   range.setEnd(editor, 0);
    
  //   await click('[data-test-button-id="unordered-list"]');
  //   assert.equal(editor.childElementCount, 1);
  //   const list = editor.firstElementChild;
  //   assert.equal(list.tagName, 'UL');
  //   assert.equal(list.childElementCount, 1);
  //   const firstLi = list.firstElementChild;
  //   assert.equal(firstLi.tagName, 'LI');
  //   assert.equal(list.firstElementChild.textContent.includes('A case - with br-tag  new line.  we Will need to refine this.'), true);
  // });

  // TODO: Not OK yet
  // test('Case 6', async function(assert) {
  //   this.set('rdfaEditorInit', (editor) => {
  //     editor.setHtmlContent('<ul><li> The first </li><li id="innerLi"> a some text </li><li> the last </li></ul>');
  //   });
  //   await render(hbs`<Rdfa::RdfaEditor
  //     @rdfaEditorInit={{action rdfaEditorInit}}
  //     @profile="default"
  //     class="rdfa-playground"
  //     @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
  //     @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
  //   />`);

  //   const innerLi = document.querySelector("#innerLi");
  //   await window.getSelection().selectAllChildren(innerLi);
  //   const range = window.getSelection().getRangeAt(0);
  //   range.setStart(innerLi, 1);
  //   range.setEnd(innerLi, 1);
  //   const editor = document.querySelector("div[contenteditable]");
  //   await click('[data-test-button-id="insert-unindent"]');
  //   console.log(editor.innerHTML);
  //   assert.equal(editor.childElementCount, 3);
  //   const firstList = editor.firstElementChild;
  //   assert.equal(firstList.tagName, 'UL');
  //   assert.equal(firstList.childElementCount, 1);
  //   const firstLi = firstList.firstElementChild;
  //   assert.equal(firstLi.tagName, 'LI');
  //   assert.equal(firstLi.textContent.includes(' The first '), true);
  //   const inBetweenElement = editor.childNodes[1];
  //   assert.equal(inBetweenElement.textContent.includes(' a some text '), true);
  //   const secondList = editor.childNodes[2];
  //   assert.equal(secondList.tagName, 'UL');
  //   assert.equal(secondList.childElementCount, 1);
  //   const secondLi = secondList.firstElementChild;
  //   assert.equal(secondLi.tagName, 'LI');
  //   assert.equal(secondLi.textContent.includes(' the last '), true);
  // });

  test('Case 7', async function(assert) {
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

    const innerLi = document.querySelector("#innerLi");
    await window.getSelection().selectAllChildren(innerLi);
    const range = window.getSelection().getRangeAt(0);
    range.setStart(innerLi, 1);
    range.setEnd(innerLi, 1);
    const editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="insert-unindent"]');
    assert.equal(editor.textContent.includes('a some text'), true);
  });

  //TODO: even though this is the intende behavoir, it feels strange
  test('Case 8', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('<ul><li id="innerLi"> a some <div> block element text </div>  other text </li></ul>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    const innerLi = document.querySelector("#innerLi");
    await window.getSelection().selectAllChildren(innerLi);
    const range = window.getSelection().getRangeAt(0);
    range.setStart(innerLi, 0);
    range.setEnd(innerLi, 0);
    const editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="insert-unindent"]');
    assert.equal(editor.textContent.includes('a some '), true);
    const list = editor.childNodes[2];
    assert.equal(list.tagName, 'UL');
    assert.equal(list.childElementCount, 1);
    const listElement = list.firstElementChild;
    assert.equal(listElement.tagName, 'LI');
    assert.equal(listElement.childElementCount, 1);
    assert.equal(listElement.textContent.includes('block element text  other text'), true);

  });

  // TODO: Not OK yet
  // test('Case 9', async function(assert) {
  //   this.set('rdfaEditorInit', (editor) => {
  //     editor.setHtmlContent('<ul><li> item 1</li><li><ul><li> subitem 1</li><li id="innerLi"> subitem 2 </li><li> subitem 3</li></ul></li><li> item 2</li></ul>');
  //   });
  //   await render(hbs`<Rdfa::RdfaEditor
  //     @rdfaEditorInit={{action rdfaEditorInit}}
  //     @profile="default"
  //     class="rdfa-playground"
  //     @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
  //     @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
  //   />`);

  //   const innerLi = document.querySelector("#innerLi");
  //   await window.getSelection().selectAllChildren(innerLi);
  //   const range = window.getSelection().getRangeAt(0);
  //   range.setStart(innerLi, 0);
  //   range.setEnd(innerLi, 0);
  //   const editor = document.querySelector("div[contenteditable]");
  //   await click('[data-test-button-id="insert-unindent"]');
  //   const list = editor.firstChild;
  //   assert.equal(list.tagName, 'UL');
  //   assert.equal(list.childElementCount, 5);
  //   const secondElement = list.childNodes[1];
  //   assert.equal(secondElement.tagName, 'LI');
  //   assert.equal(secondElement.childElementCount, 1);
  //   const innerListOnSecondElement = secondElement.firstChild;
  //   assert.equal(innerListOnSecondElement.tagName, 'UL');
  //   assert.equal(innerListOnSecondElement.childElementCount, 1);
  //   const listItemOnInnerListOnSecondElement = innerListOnSecondElement.firstChild;
  //   assert.equal(listItemOnInnerListOnSecondElement.tagName, 'LI');
  //   assert.equal(listItemOnInnerListOnSecondElement.childElementCount, 1);
  //   assert.equal(listItemOnInnerListOnSecondElement.textContent.includes(' subitem 1'), true);
  //   const thirdElement = list.childNodes[2];
  //   assert.equal(thirdElement.tagName, 'LI');
  //   assert.equal(thirdElement.childElementCount, 1);
  //   assert.equal(thirdElement.textContent.includes(' subitem 2 '), true);
  //   const fourthElement = list.childNodes[3];
  //   assert.equal(fourthElement.tagName, 'LI');
  //   assert.equal(fourthElement.childElementCount, 1);
  //   const innerListOnFourthElement = fourthElement.firstChild;
  //   assert.equal(innerListOnFourthElement.tagName, 'UL');
  //   assert.equal(innerListOnFourthElement.childElementCount, 1);
  //   const listItemOnInnerListOnFourthElement = innerListOnFourthElement.firstChild;
  //   assert.equal(listItemOnInnerListOnFourthElement.tagName, 'LI');
  //   assert.equal(listItemOnInnerListOnFourthElement.childElementCount, 1);
  //   assert.equal(listItemOnInnerListOnFourthElement.textContent.includes(' subitem 3'), true);
  // });

  // TODO: Not OK yet
  // test('Case 10', async function(assert) {
  //   this.set('rdfaEditorInit', (editor) => {
  //     editor.setHtmlContent('<ul><li> item 1</li><li><ul><li> subitem 1</li><li><div id="innerLi"> subitem 2 </div></li><li> subitem 3</li></ul></li><li> item 2</li></ul>');
  //   });
  //   await render(hbs`<Rdfa::RdfaEditor
  //     @rdfaEditorInit={{action rdfaEditorInit}}
  //     @profile="default"
  //     class="rdfa-playground"
  //     @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
  //     @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
  //   />`);

  //   const innerLi = document.querySelector("#innerLi");
  //   await window.getSelection().selectAllChildren(innerLi);
  //   const range = window.getSelection().getRangeAt(0);
  //   range.setStart(innerLi, 0);
  //   range.setEnd(innerLi, 0);
  //   const editor = document.querySelector("div[contenteditable]");
  //   await click('[data-test-button-id="insert-unindent"]');
  //   const list = editor.firstChild;
  //   assert.equal(list.tagName, 'UL');
  //   assert.equal(list.childElementCount, 5);
  //   const secondElement = list.childNodes[1];
  //   assert.equal(secondElement.tagName, 'LI');
  //   assert.equal(secondElement.childElementCount, 1);
  //   const innerListOnSecondElement = secondElement.firstChild;
  //   assert.equal(innerListOnSecondElement.tagName, 'UL');
  //   assert.equal(innerListOnSecondElement.childElementCount, 1);
  //   const listItemOnInnerListOnSecondElement = innerListOnSecondElement.firstChild;
  //   assert.equal(listItemOnInnerListOnSecondElement.tagName, 'LI');
  //   assert.equal(listItemOnInnerListOnSecondElement.childElementCount, 1);
  //   assert.equal(listItemOnInnerListOnSecondElement.textContent.includes(' subitem 1'), true);
  //   const thirdElement = list.childNodes[2];
  //   assert.equal(thirdElement.tagName, 'LI');
  //   assert.equal(thirdElement.childElementCount, 1);
  //   assert.equal(thirdElement.textContent.includes(' subitem 2 '), true);
  //   const fourthElement = list.childNodes[3];
  //   assert.equal(fourthElement.tagName, 'LI');
  //   assert.equal(fourthElement.childElementCount, 1);
  //   const innerListOnFourthElement = fourthElement.firstChild;
  //   assert.equal(innerListOnFourthElement.tagName, 'UL');
  //   assert.equal(innerListOnFourthElement.childElementCount, 1);
  //   const listItemOnInnerListOnFourthElement = innerListOnFourthElement.firstChild;
  //   assert.equal(listItemOnInnerListOnFourthElement.tagName, 'LI');
  //   assert.equal(listItemOnInnerListOnFourthElement.childElementCount, 1);
  //   assert.equal(listItemOnInnerListOnFourthElement.textContent.includes(' subitem 3'), true);
  // });

  test('Case 11', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('<ul><li> The first </li><li id="innerLi"> a some text</li><li> the last </li></ul>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    const innerLi = document.querySelector("#innerLi");
    await window.getSelection().selectAllChildren(innerLi);
    const range = window.getSelection().getRangeAt(0);
    range.setStart(innerLi, 0);
    range.setEnd(innerLi, 0);
    const editor = document.querySelector("div[contenteditable]");
    await click('[data-test-button-id="ordered-list"]');
    const list = editor.firstChild;
    assert.equal(list.tagName, 'OL');
  });

});
