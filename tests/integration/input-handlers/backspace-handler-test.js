import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | InputHandler | backspace-handler', function(hooks) {
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

  test('it backspaces properly', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('capybaras');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const wordNode = editor.childNodes[0];
    window.getSelection().collapse(wordNode,9);
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    assert.dom('div[contenteditable]').hasText('capybara');

  });

  test('backspace tests case 1: consecutive breaks', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz<br><br>foo');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const fooWordNode = editor.childNodes[3];
    window.getSelection().collapse(fooWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 100);
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, 'baz<br>foo');
    const cursorPosition = window.getSelection().anchorOffset;
    const cursorNode = window.getSelection().anchorNode;
    assert.ok(cursorPosition == 0 && cursorNode.textContent == "foo", "cursor is where it should be");
  });

  test('backspace tests case 2: invisible spans', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz<span></span>foo');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 500);
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, 'bafoo');
    const cursorPosition = window.getSelection().anchorOffset;
    const cursorNode = window.getSelection().anchorNode;
    assert.ok(cursorPosition == 2 && cursorNode.textContent == "ba", "cursor is where it should be");
  });

  test('backspace tests case 3: spans with text', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz <span style="background-color:green">bar</span>foo');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const innerHtml = editor.innerHTML;
    await setTimeout(() => {}, 100);
    assert.equal(innerHtml, 'baz <span data-editor-position-level="0">ba</span>foo');
    const cursorPosition = window.getSelection().anchorOffset;
    assert.equal(cursorPosition, 2);
  });

  test('backspace tests case 4: backspacing into a div with a br', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('<div>foo<br></div>&nbsp;');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    window.getSelection().collapse(editor,1);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 500);
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, '<div data-editor-position-level="0">foo<br></div>&nbsp;');
    const cursorNode = window.getSelection().anchorNode;
    const cursorPosition = window.getSelection().anchorOffset;
    assert.ok(cursorNode.textContent == "foo" && cursorPosition == 3, "cursor at the end of foo");
  });

  test('backspace tests case 5: backspacing into an empty div', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz <div style="background-color:green"></div>foo');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 100);
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, 'baz foo');
    const cursorPosition = window.getSelection().anchorNode;
    assert.equal(cursorPosition.textContent, "baz ");
  });

  test('backspace tests case 6: backspacing into a div', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz <div style="background-color:green">foo</div>&nbsp;');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, 'baz <div data-editor-position-level="0">foo</div>&nbsp;');
    const cursorPosition = window.getSelection().anchorOffset;
    const cursorNode = window.getSelection().anchorNode;
    assert.ok(cursorPosition == 3 && cursorNode.textContent == "foo", "cursor at the end of foo");
  });

  test('backspace lump node case 1: it flags the block', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:green">bar</div>foo');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode,0);
    click('div[contenteditable]');
    await setTimeout(() => {}, 100);
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, 'baz <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" data-flagged-remove="complete">bar</div>foo');
    const cursorPosition = window.getSelection().anchorOffset;
    assert.equal(cursorPosition, 0);
  });

  test('backspace lump node case 1: it removes the block on the second backspace', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:green">bar</div>foo');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 500);
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 100);
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, 'baz foo');
  });

  test('backspace lump node case 2: it flags the block', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:green">bar</div>&nbsp;');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, 'baz <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" data-flagged-remove="complete">bar</div>&nbsp;');
    const cursorPosition = window.getSelection().anchorOffset;
    assert.equal(cursorPosition, 0);
  });

  test('backspace lumpnode case 2: it removes the block on the second backspace', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:green">bar</div>&nbsp;');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 500);
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 500);
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, 'baz &nbsp;');
  });

  test('backspace lump node case 3: it flags the block', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(`baz
      <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:green">
        <span style="background-color:grey">some textNode number 1</span>
        <span style="background-color:pink">bar number 1</span>
      </div><div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:red">
        <span style="background-color:teal">some textNode number 2</span>
        <span style="background-color:aqua">bar number 2</span>
      </div>
      foo`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const fooWordNode = editor.childNodes[3];
    window.getSelection().collapse(fooWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 500);
    const lumpNode = editor.childNodes[2];
    console.warn(lumpNode);
    assert.equal(lumpNode.getAttribute("data-flagged-remove"),"complete");
    const cursorPosition = window.getSelection().anchorOffset;
    assert.equal(cursorPosition, 0);
  });

  test('backspace lump node case 3: it removes the block on the second backspace', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(`baz
      <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:green">
        <span style="background-color:grey">some textNode number 1</span>
        <span style="background-color:pink">bar number 1</span>
      </div><div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:red">
        <span style="background-color:teal">some textNode number 2</span>
        <span style="background-color:aqua">bar number 2</span>
      </div>
      foo`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const fooWordNode = editor.childNodes[3];
    window.getSelection().collapse(fooWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 500);
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 500);
    const innerHtml = editor.innerHTML;
    assert.equal(editor.childNodes.length, 3);
  });

  test('backspace ignores breakline as it doesn\'t render in the editor', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(`baz

      <span>foo</span>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const fooWordNode = editor.childNodes[1];
    window.getSelection().collapse(fooWordNode,0);
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 500);
    const innerHtml = editor.innerHTML;
    assert.equal(innerHtml, `ba<span>foo</span>`);
    const cursorPosition = window.getSelection().anchorOffset;
    assert.equal(cursorPosition, 2);
  });
  test('backspace properly handles spaces at edges', async function(assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(`<div id="spacetest">a visual space test f</div>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{action rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector("div[contenteditable]");
    const divNode = editor.childNodes[0];
    window.getSelection().collapse(divNode,1); // after the textNode
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 500);
    assert.equal(divNode.innerText.replace(/\s/g, " "), "a visual space test ");
    const textNode = divNode.childNodes[0];
    window.getSelection().collapse(textNode,1); // after 'a' inside the textNode
    click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await setTimeout(() => {}, 500);
    assert.equal(divNode.innerText.replace(/\s/g, " "), " visual space test ");
  });

});
