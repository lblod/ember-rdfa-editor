import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module.skip('Integration | InputHandler | arrow-handler', function (hooks) {
  setupRenderingTest(hooks);

  test('arrow right works', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz foo');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    window.getSelection().collapse(editor, 0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'ArrowRight');
    const cursorPosition = window.getSelection().anchorOffset;
    assert.strictEqual(cursorPosition, 1);
  });

  test('arrow left works', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz <div>foo</div>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const bazNode = editor.childNodes[0];
    window.getSelection().collapse(bazNode, 1);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'ArrowLeft');
    const cursorPosition = window.getSelection().anchorOffset;
    assert.strictEqual(cursorPosition, 0);
  });

  test('arrow right works with blocks', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz<div>foo</div>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const bazWordNode = editor.childNodes[0];
    window.getSelection().collapse(bazWordNode, 0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'ArrowRight');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'ArrowRight');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'ArrowRight');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'ArrowRight');
    const cursorPosition = window.getSelection().anchorOffset;
    assert.strictEqual(cursorPosition, 0);
  });

  test('arrow left works with blocks', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz<div>foo</div>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const bazWordNode = editor.childNodes[1];
    window.getSelection().collapse(bazWordNode, 0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'ArrowLeft');
    const cursorPosition = window.getSelection().anchorOffset;
    assert.strictEqual(cursorPosition, 3);
  });
});
