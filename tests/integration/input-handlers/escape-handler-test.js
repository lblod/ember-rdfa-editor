import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import type from '../util/type-helper';

module('Integration | InputHandler | escape-handler', function(hooks) {
  setupRenderingTest(hooks);

  test('escape handler works', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('');
    });
    await render(hbs`
      <Rdfa::RdfaEditor
        @rdfaEditorInit={{this.rdfaEditorInit}}
        @profile="default"
        class="rdfa-playground"
        @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
        @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
      />
    `);
    await click('div[contenteditable]');
    await type('div[contenteditable]', 'hello');
    await triggerKeyEvent(document.activeElement, 'keydown', 'Escape');
    assert.strictEqual(document.activeElement.tagName, 'BODY');
  });
  
});