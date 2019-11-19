import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { keyEvent } from 'ember-native-dom-helpers';
import EmberObject from '@ember/object';

module('Integration | Component | content editable', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.on('myAction', function(val) { ... });

    await render(hbs`{{content-editable}}`);

    assert.dom('*').hasText('');

    // Template block usage:
    await render(hbs`
      {{#content-editable}}
        template block text
      {{/content-editable}}
    `);

    assert.dom('*').hasText('template block text');
  });

  test('add text in editor, expect correct actions are called', async function(assert){
    assert.expect(2);
    let insertedText = 'world';

    this.set('editorClient', EmberObject.extend({
      editor: null,
      rawEditorInitHandler(editor){
        this.set('editor', editor);
        this.set('removedHandlerCalls', 0); //removeHandler will be called multiple times.
      },
      textInsertHandler(pos, part){
        if(this.get('removedHandlerCalls') === 1){
          assert.equal(part, insertedText);
          assert.equal(this.get('editor.currentTextContent'), insertedText);
        }
        this.set('removedHandlerCalls', this.get('removedHandlerCalls') + 1);
      }

    }).create());

    await render(hbs`{{content-editable textInsert=(action editorClient.textInsertHandler) \
                rawEditorInit=(action editorClient.rawEditorInitHandler) focused=true}}`);

    // fill editor
    find('.editor').textContent;

    await keyEvent('.editor', 'keyup');
  });

  test('remove text in editor, expect correct actions are called', async function(assert){
    assert.expect(3);
    let textAfterRemoval = 'hello';

    this.set('editorClient', EmberObject.extend({
      rawEditorInitHandler(editor){
        this.set('editor', editor);
        this.set('removedHandlerCalls', 0); //removeHandler will be called multiple times.
      },
      textRemoveHandler(pos, delta){
        if(this.get('removedHandlerCalls') === 1){
          assert.equal(pos, 5);
          assert.equal(delta, 12);
          assert.equal(this.get('editor.currentTextContent'), textAfterRemoval);
        }
        this.set('removedHandlerCalls', this.get('removedHandlerCalls') + 1);
      }

    }).create());

    await render(hbs`{{#content-editable textRemove=(action editorClient.textRemoveHandler) \
    rawEditorInit=(action editorClient.rawEditorInitHandler) focused=true}}hello world{{/content-editable}}`);

    // fill editor
    find('.editor').textContent;

    await keyEvent('.editor', 'keyup');
  });

  test('should trigger external action with editor content after key-down event is called', async function(assert) {
    //defines how many assers are expected
    assert.expect(1);

    // mock external action
    this.set('externalAction', actual => {
      let expected = [0, 0].toString();
      assert.equal(actual.toString(), expected, 'submitted value is passed to external action');
    });

    await render(hbs`{{content-editable selectionUpdate=(action externalAction)}}`);

    // fill editor
    find('.editor').textContent;

    await keyEvent('.editor', 'keyup');
  });
});
