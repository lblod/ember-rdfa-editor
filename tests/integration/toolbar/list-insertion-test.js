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
    const innerHtml = editor.innerHTML;


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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ol data-editor-position-level=\"1\"><li>test</li><li data-editor-position-level=\"0\">second test​</li></ol>");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ul data-editor-position-level=\"3\"><li data-editor-position-level=\"2\">test​<ul data-editor-position-level=\"1\"><li data-editor-position-level=\"0\">second test​</li></ul></li></ul>");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ol data-editor-position-level=\"3\"><li data-editor-position-level=\"2\">test​<ol data-editor-position-level=\"1\"><li data-editor-position-level=\"0\">second test​</li></ol></li></ol>");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ul data-editor-position-level=\"1\"><li>test​<ul><li>second test</li></ul></li><li data-editor-position-level=\"0\">third test​</li></ul>");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ol data-editor-position-level=\"1\"><li>test​<ol><li>second test</li></ol></li><li data-editor-position-level=\"0\">third test​</li></ol>");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ul data-editor-position-level=\"5\"><li data-editor-position-level=\"4\">test​<ul data-editor-position-level=\"3\"><li data-editor-position-level=\"2\">​<ul data-editor-position-level=\"1\"><li data-editor-position-level=\"0\">second test​</li></ul></li></ul></li></ul>");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ol data-editor-position-level=\"5\"><li data-editor-position-level=\"4\">test​<ol data-editor-position-level=\"3\"><li data-editor-position-level=\"2\">​<ol data-editor-position-level=\"1\"><li data-editor-position-level=\"0\">second test​</li></ol></li></ol></li></ol>");
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


    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ul data-editor-position-level=\"3\"><li data-editor-position-level=\"2\">test​<ul data-editor-position-level=\"1\"><li>second test</li><li data-editor-position-level=\"0\">third test​</li></ul></li></ul>");
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


    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ol data-editor-position-level=\"3\"><li data-editor-position-level=\"2\">test​<ol data-editor-position-level=\"1\"><li>second test</li><li data-editor-position-level=\"0\">third test​</li></ol></li></ol>");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ul><li>test</li></ul><br>second test​​");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ol><li>test</li></ol><br>second test​​");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ul data-editor-position-level=\"1\"><li data-editor-position-level=\"0\">test​</li></ul>");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ol data-editor-position-level=\"1\"><li data-editor-position-level=\"0\">test​</li></ol>");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "test<br>​<ul data-editor-position-level=\"1\"><li data-editor-position-level=\"0\">second test​</li></ul>");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "test<br>​<ol data-editor-position-level=\"1\"><li data-editor-position-level=\"0\">second test​</li></ol>");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "test<br>​<ul data-editor-position-level=\"1\"><li data-editor-position-level=\"0\">second test​</li></ul>");
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
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "test<br>​<ol data-editor-position-level=\"1\"><li data-editor-position-level=\"0\">second test​</li></ol>");
  });

});
