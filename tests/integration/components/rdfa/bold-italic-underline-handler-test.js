import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | bold-italic-underline-handler', function(hooks) {
  setupRenderingTest(hooks);

  test('converting to bold works', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    window.getSelection().selectAllChildren(editor);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 66, {ctrlKey: true});

    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, '<strong data-editor-position-level="0">baz</strong>');
  });

  test('converting to italic works', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    window.getSelection().selectAllChildren(editor);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 73, {ctrlKey: true});

    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, '<em data-editor-position-level="0">baz</em>');
  });

  test('converting to underline works', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    window.getSelection().selectAllChildren(editor);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 85, {ctrlKey: true});

    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, '<u data-editor-position-level="0">baz</u>');
  });

});
