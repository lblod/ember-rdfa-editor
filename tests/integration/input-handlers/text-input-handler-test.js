import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import type from '../util/type-helper';

module.skip('Integration | InputHandler | text-input-handler', function(hooks) {
  setupRenderingTest(hooks);

  test('type text in an empty editor', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    await type('div[contenteditable]', 'foo');
    await setTimeout(() => {}, 500);
    //There is an invisible space somewhere but I consider this an implementation detail
    assert.ok(editor.innerText.includes('foo'), '"foo" has been inserted in the editor');
  });

  test('type text in the middle of a word', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('john');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = document.querySelector("div[contenteditable]");
    const textNode = editor.childNodes[0];
    window.getSelection().collapse(textNode,2);
    click('div[contenteditable]');
    await type('div[contenteditable]', 'doe');
    await setTimeout(() => {}, 500);
    assert.dom('div[contenteditable]').hasText('jodoehn');
  });


});
