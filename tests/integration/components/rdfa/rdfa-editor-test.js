import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, typeIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | rdfa-editor', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // this.on('handleRdfaEditorInit', () => {
    //   console.log('init');
    // });
    await render(hbs`<Rdfa::RdfaEditor
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    assert.dom('.say-editor').exists();

  });

  test('it deletes properly', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });
    // this.on('handleRdfaEditorInit', () => {
    //   console.log('init');
    // });
    await render(hbs`<Rdfa::RdfaEditor
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    await triggerKeyEvent('div[contenteditable]', 'keydown', 67); //c
    await triggerKeyEvent('div[contenteditable]', 'keydown', 65); //a
    await triggerKeyEvent('div[contenteditable]', 'keydown', 80); //p
    await triggerKeyEvent('div[contenteditable]', 'keydown', 89); //y
    await triggerKeyEvent('div[contenteditable]', 'keydown', 66); //b
    await triggerKeyEvent('div[contenteditable]', 'keydown', 65); //a
    await triggerKeyEvent('div[contenteditable]', 'keydown', 82); //r
    await triggerKeyEvent('div[contenteditable]', 'keydown', 65); //a
    await triggerKeyEvent('div[contenteditable]', 'keydown', 83); //s

    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    assert.dom('div[contenteditable]').hasText('capybara');

  });

});
