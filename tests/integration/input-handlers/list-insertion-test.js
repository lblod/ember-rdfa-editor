import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import type from '../util/type-helper';

module('Integration | InputHandler | list-insertion', function(hooks) {
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
    click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');

    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, '​<ul data-editor-position-level="1"><li data-editor-position-level="0">test​</li></ul>');
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
    click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');

    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, '​<ol data-editor-position-level="1"><li data-editor-position-level="0">test​</li></ol>');
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
    click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    await type('div[contenteditable]', 'second test');
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ul data-editor-position-level=\"1\"><li>test</li><li data-editor-position-level=\"0\">second test​</li></ul>");
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
    click('[data-test-button-id="ordered-list"]');
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
    click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    click('[data-test-button-id="insert-indent"]');
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
    click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    click('[data-test-button-id="insert-indent"]');
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
    click('[data-test-button-id="unordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    click('[data-test-button-id="insert-unindent"]');
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
    click('[data-test-button-id="ordered-list"]');
    await type('div[contenteditable]', 'test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    click('[data-test-button-id="insert-indent"]');
    await type('div[contenteditable]', 'second test');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');
    click('[data-test-button-id="insert-unindent"]');
    await type('div[contenteditable]', 'third test');
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, "​<ol data-editor-position-level=\"1\"><li>test​<ol><li>second test</li></ol></li><li data-editor-position-level=\"0\">third test​</li></ol>");
  });

});
