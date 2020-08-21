import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | InputHandler | enter-handler', function(hooks) {
  setupRenderingTest(hooks);


  test('enter handler works', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('<p>baz</p>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const bazWordNode = editor.childNodes[0];
    window.getSelection().collapse(bazWordNode,1);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');

    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, '<p>baz</p><p data-editor-position-level="0">​</p>');
    const cursorPosition = window.getSelection().anchorOffset;
    assert.equal(cursorPosition, 0);
  });

  test('enter handler works with li', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('<li>baz</li>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const bazWordNode = editor.childNodes[0];
    window.getSelection().collapse(bazWordNode,1);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Enter');

    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, '<li>baz</li><li data-editor-position-level="0"></li>');
    const cursorPosition = window.getSelection().anchorOffset;
    assert.equal(cursorPosition, 0);
  });

});
