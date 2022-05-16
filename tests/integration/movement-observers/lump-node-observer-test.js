import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module.skip(
  'Integration | MovementObserver | lump-node-observer',
  function (hooks) {
    setupRenderingTest(hooks);

    test('click in a lump-node will place caret outside lump-node', async function (assert) {
      this.set('rdfaEditorInit', (editor) => {
        editor.setHtmlContent(`
      beer
      <div property='http://lblod.data.gift/vocabularies/editor/isLumpNode'>
          <span data-test-target="click-target"> don't drink mine </span>
      </div>
      pong`);
      });

      await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

      const editor = document.querySelector('div[contenteditable]');
      const drinkNode = editor.children[0].children[0].childNodes[0];
      window.getSelection().collapse(drinkNode, 1);
      click('div[contenteditable]');
      await new Promise((r) => setTimeout(r, 500)); //observer is some post-processing, hence the waiting. TODO: some day this will be consitent
      assert.true(
        window.getSelection().anchorNode.textContent.indexOf('pong') > 0
      );
    });

    test('click in a lump-node (the only node inside the editor) will place caret outside lump-node', async function (assert) {
      this.set('rdfaEditorInit', (editor) => {
        editor.setHtmlContent(`<div property='http://lblod.data.gift/vocabularies/editor/isLumpNode'>
          <span data-test-target="click-target"> don't drink mine </span>
      </div>`);
      });

      await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

      const editor = document.querySelector('div[contenteditable]');
      const drinkNode = editor.children[0].children[0].childNodes[0];
      window.getSelection().collapse(drinkNode, 1);
      click('div[contenteditable]');
      await new Promise((r) => setTimeout(r, 500)); //observer is some post-processing, hence the waiting. TODO: some day this will be consitent
      assert.strictEqual(
        window.getSelection().anchorNode.parentElement,
        editor
      );
    });
  }
);
