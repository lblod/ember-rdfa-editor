import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | InputHandler | tab-handler', function(hooks) {
  setupRenderingTest(hooks);

  test('tab works with li', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('<ul><li>baz</li><li>foo</li></ul>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const bazWordNode = editor.childNodes[0].childNodes[0];
    window.getSelection().collapse(bazWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Tab');
    assert.equal(window.getSelection().baseNode.data, 'foo');
    const cursorPosition = window.getSelection().anchorOffset;
    assert.equal(cursorPosition, 0);
  });


  test('tab works with p', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('<p>baz</p><p>foo</p>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const bazWordNode = editor.childNodes[0];
    window.getSelection().collapse(bazWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Tab');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Tab');
    assert.equal(window.getSelection().baseNode.textContent, "foo");
    const cursorPosition = window.getSelection().anchorOffset;
    assert.equal(cursorPosition, 0);
  });


  test('tab works with div', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('<div>baz</div><div>foo</div>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const bazWordNode = editor.childNodes[0];
    window.getSelection().collapse(bazWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Tab');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Tab');
    assert.equal(window.getSelection().baseNode.textContent, 'foo');
    const cursorPosition = window.getSelection().anchorOffset;
    assert.equal(cursorPosition, 0);
  });

});
