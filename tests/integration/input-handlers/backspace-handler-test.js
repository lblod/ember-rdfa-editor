import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, triggerKeyEvent, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module.skip('Integration | InputHandler | backspace-handler', function (hooks) {
  setupRenderingTest(hooks);

  test('editor renders', async function (assert) {
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

  test('it backspaces properly', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('capybaras');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const wordNode = editor.childNodes[0];
    window.getSelection().collapse(wordNode, 9);
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    assert.dom('div[contenteditable]').hasText('capybara');
  });

  test('backspace on breaks: jump over first break before blocks', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        '<div>this is a block and it has a break after it</div><br><div>this block is followed by two breaks</div>'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const secondDiv = editor.childNodes[2];
    window.getSelection().collapse(secondDiv, 0); // cursor at start of div
    await click('div[contenteditable]'); // ensure editor state
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const cursorNode = window.getSelection().anchorNode;
    assert.strictEqual(editor.childNodes.length, 2);
    assert.strictEqual(
      cursorNode.previousSibling,
      editor.childNodes[0],
      'cursor should be at beginning of second div'
    );
  });

  test('backspace on non editable', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('<div contenteditable=false>non-editable</div>foo');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
      />`);
    var editor = document.querySelector('div[contenteditable]');
    const foo = editor.childNodes[1];
    window.getSelection().collapse(foo, 0); // cursor at start of div
    await click(editor); // ensure editor state
    await triggerKeyEvent(editor, 'keydown', 'Backspace');
    assert.dom('div[contenteditable]').hasText('non-editablefoo');
  });

  test('backspace on breaks: consecutive breaks', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz<br><br>foo');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = document.querySelector('div[contenteditable]');
    const fooWordNode = editor.childNodes[3];
    window.getSelection().collapse(fooWordNode, 0);
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');

    const innerHtml = editor.innerHTML;
    assert.strictEqual(innerHtml, 'baz<br>foo');
    const cursorPosition = window.getSelection().anchorOffset;
    const cursorNode = window.getSelection().anchorNode;
    const positionCorrect =
      cursorPosition == 0 && cursorNode.textContent == 'foo';
    assert.ok(positionCorrect, 'cursor is where it should be');
  });

  test('backspace inline elements: invisible span', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('baz<span></span>foo');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode, 0);
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const innerHtml = editor.innerHTML;
    assert.strictEqual(innerHtml, 'bafoo');
    const cursorPosition = window.getSelection().anchorOffset;
    const cursorNode = window.getSelection().anchorNode;
    const positionCorrect =
      cursorPosition == 2 && cursorNode.textContent == 'bafoo';
    assert.ok(positionCorrect, 'cursor is where it should be');
  });

  test('backspace inline elements: spans with text', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        'baz <span style="background-color:green">bar</span>foo'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode, 0);
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const innerHtml = editor.innerHTML;
    assert.strictEqual(
      innerHtml,
      'baz <span style="background-color:green">bafoo</span>'
    );
    const cursorPosition = window.getSelection().anchorOffset;
    assert.strictEqual(cursorPosition, 2);
  });

  test('backspace block elements: backspacing into a div with a br', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent('<div>foo<br></div>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    window.getSelection().collapse(editor, 1);
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const innerHtml = editor.innerHTML;
    assert.strictEqual(innerHtml, '<div>foo</div>');
    const cursorPosition = window.getSelection().anchorOffset;
    const positionCorrect = cursorPosition == 1;
    assert.ok(positionCorrect, 'cursor at the end of the div');
  });

  test('backspace block elements: backspacing into an empty div', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        'baz <div style="background-color:green"></div>foo'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode, 0);
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const innerHtml = editor.innerHTML;
    assert.strictEqual(innerHtml, 'baz foo');
    const cursorNode = window.getSelection().anchorNode;
    const cursorPosition = window.getSelection().anchorOffset;
    assert.strictEqual(cursorNode.textContent, 'baz foo');
    assert.strictEqual(cursorPosition, 4);
  });

  test('backspace block elements: backspacing into a div', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        'baz <div style="background-color:green">foo</div>'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    // const divNode = editor.childNodes[1];
    window.getSelection().collapse(editor, 2);
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const innerHtml = editor.innerHTML;
    assert.strictEqual(
      innerHtml,
      'baz <div style="background-color:green">foo</div>'
    );
    const cursorPosition = window.getSelection().anchorOffset;
    const cursorNode = window.getSelection().anchorNode;
    const positionCorrect =
      cursorPosition == 1 && cursorNode.textContent == 'foo';
    assert.ok(positionCorrect, 'cursor at the end of foo');
  });

  test('backspace lump node case 1: it removes the block on the second backspace', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        'baz <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:green">bar</div>foo'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode, 0);
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const innerHtml = editor.innerHTML;
    assert.strictEqual(innerHtml, 'baz foo');
  });

  test('backspace lump node case 2: it flags the block', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        'baz <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:green">bar</div>&nbsp;'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode, 0);
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const innerHtml = editor.innerHTML;
    assert.strictEqual(
      innerHtml,
      'baz <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" data-flagged-remove="complete">bar</div>&nbsp;'
    );
    const cursorPosition = window.getSelection().anchorOffset;
    assert.strictEqual(cursorPosition, 0);
  });

  test('backspace lumpnode case 2: it removes the block on the second backspace', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(
        'baz <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:green">bar</div>&nbsp;'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const fooWordNode = editor.childNodes[2];
    window.getSelection().collapse(fooWordNode, 0);
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const innerHtml = editor.innerHTML;
    assert.strictEqual(innerHtml, 'baz &nbsp;');
  });

  test('backspace lump node case 3: it flags the block', async function (assert) {
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
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const fooWordNode = editor.childNodes[3];
    window.getSelection().collapse(fooWordNode, 0);
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    const lumpNode = editor.childNodes[2];
    assert.strictEqual(
      lumpNode.getAttribute('data-flagged-remove'),
      'complete'
    );
    const cursorPosition = window.getSelection().anchorOffset;
    assert.strictEqual(cursorPosition, 0);
  });

  test('backspace lump node case 3: it removes the block on the second backspace', async function (assert) {
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
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const fooWordNode = editor.childNodes[3];
    window.getSelection().collapse(fooWordNode, 0);
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    assert.strictEqual(
      editor.innerHTML,
      `baz
    <div property="http://lblod.data.gift/vocabularies/editor/isLumpNode" style="background-color:green">
      <span style="background-color:grey">some textNode number 1</span>
      <span style="background-color:pink">bar number 1</span>
    </div>
    foo`
    );
  });

  test('backspace properly handles spaces at end properly', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(`<div id="spacetest">a visual space test f</div>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const divNode = editor.childNodes[0];
    window.getSelection().collapse(divNode, 1); // after the textNode
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    assert.strictEqual(
      editor.childNodes[0].innerText.replace(/\s/g, ' '),
      'a visual space test '
    );
  });

  test('backspace properly handles spaces at start properly', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(`<div id="spacetest">a visual space test f</div>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const divNode = editor.childNodes[0];
    const textNode = divNode.childNodes[0];
    window.getSelection().collapse(textNode, 1); // after 'a' inside the textNode
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    assert.strictEqual(
      editor.childNodes[0].textContent.replace(/\s/g, ' '),
      ' visual space test f'
    );
  });

  /********************************************************************************
   * LISTS
   ********************************************************************************/
  test('backspace at beginning of non-empty, not first <li>, merges with previous <li>', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(`<ul><li>beer</li><li>pong</li></ul>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');

    const list = editor.children[0];
    const textNode = list.children[1].childNodes[0];
    window.getSelection().collapse(textNode, 0); // before 'pong'
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    assert.strictEqual(editor.children[0].children.length, 1);
    assert.strictEqual(editor.children[0].children[0].innerText, 'beerpong');
  });

  test('backspace and empty-ing the <li> which is not the first <li>, will remove the li and keep the list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(`<ul><li>beer</li><li>b</li></ul>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const list = editor.children[0];
    const textNode = list.children[1].childNodes[0];

    window.getSelection().collapse(textNode, 1); // after 'b'
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    assert.strictEqual(editor.children[0].children.length, 1);
  });

  test('backspace at beginning of non-empty, first <li>, removes it and merges content back on top', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(`<ul><li>beer</li><li>pong</li></ul>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const list = editor.children[0];
    const textNode = list.children[0].childNodes[0];
    window.getSelection().collapse(textNode, 0); // before 'beer'
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    assert.strictEqual(editor.children[0].children.length, 1);
    assert.true(editor.childNodes[0].textContent.includes('beer'));
  });

  test('backspace and empty-ing the <li> which the first <li>, will remove the li and keep the list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(`<ul><li>b</li><li>pong</li></ul>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const list = editor.children[0];
    const textNode = list.children[0].childNodes[0];
    window.getSelection().collapse(textNode, 1); // before 'b'
    await click('div[contenteditable]');

    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    assert.strictEqual(editor.children[0].children.length, 1);
    assert.strictEqual(editor.children[0].children[0].innerText, 'pong');
  });

  test('backspace at beginning of non-empty, the only <li>, removes it and merges content back on top', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(`<ul><li>beer</li></ul>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const list = editor.children[0];
    const textNode = list.children[0].childNodes[0];
    window.getSelection().collapse(textNode, 0); // before 'beer'
    await click('div[contenteditable]');

    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    assert.strictEqual(editor.childElementCount, 0); //hence the list was removed
    assert.true(editor.childNodes[0].textContent.includes('beer'));
  });

  test('backspace and empty-ing the only <li>, will remove the li and remove the list', async function (assert) {
    this.set('rdfaEditorInit', (editor) => {
      editor.setHtmlContent(`<ul><li>b</li>/ul>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    var editor = document.querySelector('div[contenteditable]');
    const list = editor.children[0];
    const textNode = list.children[0].childNodes[0];
    window.getSelection().collapse(textNode, 1); // before 'b'
    await click('div[contenteditable]');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    await triggerKeyEvent('div[contenteditable]', 'keydown', 'Backspace');
    assert.strictEqual(editor.childElementCount, 0); //hence the list was removed
  });
});
