import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import {
  render,
  triggerKeyEvent,
  pauseTest,
  settled,
} from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import RdfaDocument from "@lblod/ember-rdfa-editor/utils/rdfa/rdfa-document";
import { getWindowSelection } from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import { timeout } from "ember-concurrency";
import { moveCaret } from "@lblod/ember-rdfa-editor/editor/utils";
import { getEditorElement } from "dummy/tests/test-utils";

module("Integration | InputHandler | delete-handler", function (hooks) {
  setupRenderingTest(hooks);

  test("it deletes a character, beginning of textNode keeps position", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("capybaras");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);

    const editor = getEditorElement();
    const wordNode = editor.childNodes[0];
    const selection = getWindowSelection();

    selection.collapse(wordNode, 0);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    assert.dom("div[contenteditable]").hasText("apybaras");
    const currentSelection = getWindowSelection();
    const newCaretPostion = currentSelection?.getRangeAt(0).getClientRects();
    assert.equal(currentSelection?.anchorNode?.textContent, "apybaras");
    assert.equal(didCaretMove(previousCaretPostion, newCaretPostion), false);
  });

  test("it deletes a character, middle of textNode keeps position", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("capybaras");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    const wordNode = editor.childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(wordNode, 5);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    assert.dom("div[contenteditable]").hasText("capybras");
    const currentSelection = getWindowSelection();
    const newCaretPostion = currentSelection.getRangeAt(0).getClientRects();
    assert.equal(currentSelection.anchorNode?.textContent, "capybras");
    assert.equal(didCaretMove(previousCaretPostion, newCaretPostion), false);
  });

  test("it deletes a character, 2 adjacent whitespaces appear, make sure they remain visible", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("bar a beer");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    const wordNode = editor.childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(wordNode, 4);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    const currentSelection = getWindowSelection();
    //comparing only the length, as the effective replacement might be very implementation specific.
    assert.equal(
      currentSelection.anchorNode?.parentElement?.innerText.length,
      "bar  beer".length
    );
    const newCaretPostion = currentSelection.getRangeAt(0).getClientRects();
    assert.equal(didCaretMove(previousCaretPostion, newCaretPostion), false);
  });

  test("it deletes a character, 2 adjacent whitespaces appear over two textNodes, make sure they remain visible [edge case]", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("bar a");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    const wordNode = editor.childNodes[0];
    editor.appendChild(document.createTextNode(" beer"));
    const selection = getWindowSelection();
    selection.collapse(wordNode, 4);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    const currentSelection = getWindowSelection();
    //comparing only the length, as the effective replacement might be very implementation specific.
    assert.equal(
      currentSelection.anchorNode?.parentElement?.innerText.length,
      "bar  beer".length
    );
    const newCaretPostion = currentSelection.getRangeAt(0).getClientRects();
    assert.equal(didCaretMove(previousCaretPostion, newCaretPostion), false);
  });

  test("it deletes a character, 2 adjacent whitespaces appear over two textNodes, make sure they remain visible [edge case number 2]", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("a beer");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    const wordNode = editor.childNodes[0];
    editor.prepend(document.createTextNode("bar "));
    const selection = getWindowSelection();
    selection.collapse(wordNode, 0);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    const currentSelection = getWindowSelection();
    //comparing only the length, as the effective replacement might be very implementation specific.
    assert.equal(
      currentSelection.anchorNode?.parentElement?.innerText.length,
      "bar  beer".length
    );
    const newCaretPostion = currentSelection.getRangeAt(0).getClientRects();
    assert.equal(didCaretMove(previousCaretPostion, newCaretPostion), false);
  });

  test("it deletes the character of the next TextNode, when at the end of the current node", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("a beer");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    const wordNode = editor.childNodes[0];
    editor.append(document.createTextNode("bar"));
    const selection = getWindowSelection();
    selection.collapse(wordNode, 6);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    const currentSelection = getWindowSelection();
    assert.equal(
      currentSelection.anchorNode?.parentElement?.innerText,
      "a beerar"
    );
    const newCaretPostion = currentSelection.getRangeAt(0).getClientRects();
    assert.equal(didCaretMove(previousCaretPostion, newCaretPostion), false);
  });

  test("it deletes the character of the next + 1 TextNode, when we have [text|][emptyTextNode][text]", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("a beer");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    const wordNode = editor.childNodes[0];
    editor.append(document.createTextNode(""));
    editor.append(document.createTextNode("bar"));
    assert.equal(editor.childNodes.length, 3); //make sure we have the three textnodes, no specific browser quircks
    const selection = getWindowSelection();
    selection.collapse(wordNode, 6);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    const currentSelection = getWindowSelection();
    assert.equal(
      currentSelection.anchorNode?.parentElement?.innerText,
      "a beerar"
    );
    const newCaretPostion = currentSelection.getRangeAt(0).getClientRects();
    assert.equal(didCaretMove(previousCaretPostion, newCaretPostion), false);
  });

  test("it removes empty span", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("beer<span></span>bar");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    const wordNode = editor.childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(wordNode, 4);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    await wait(200);
    const currentSelection = getWindowSelection();
    assert.equal(
      currentSelection.anchorNode?.parentElement?.innerText,
      "beerar"
    );
    assert.equal(editor.innerHTML, "beerar");
    const newCaretPostion = currentSelection.getRangeAt(0).getClientRects();
    assert.equal(didCaretMove(previousCaretPostion, newCaretPostion), false);
  });

  test("it removes empty div", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("beer<div></div>bar");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    const wordNode = editor.childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(wordNode, 4);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    const currentSelection = getWindowSelection();
    //triggers visual change, hence no text is removed
    assert.equal(
      currentSelection.anchorNode?.parentElement?.innerText,
      "beerbar"
    );
    assert.equal(editor.innerHTML, "beerbar");
    const newCaretPostion = currentSelection.getRangeAt(0).getClientRects();
    assert.equal(didCaretMove(previousCaretPostion, newCaretPostion), false);
  });

  test("it removes other node (e.g. comment)", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("beer");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    editor.insertAdjacentHTML("beforeend", "<!--comment-->bar");
    assert.equal(editor.innerHTML, "beer<!--comment-->bar"); //make sure the comment is included
    const wordNode = editor.childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(wordNode, 4);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    const currentSelection = getWindowSelection();
    assert.equal(
      currentSelection.anchorNode?.parentElement?.innerText,
      "beerar"
    );
    assert.equal(editor.innerHTML, "beerar");
    const newCaretPostion = currentSelection.getRangeAt(0).getClientRects();
    assert.equal(didCaretMove(previousCaretPostion, newCaretPostion), false);
  });

  test("it removes void element", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("beer<br>bar");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    const wordNode = editor.childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(wordNode, 4);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    const currentSelection = getWindowSelection();
    //we exepect visual change
    assert.equal(
      currentSelection.anchorNode?.parentElement?.innerText,
      "beerbar"
    );
    assert.equal(editor.innerHTML, "beerbar");
    const newCaretPostion = currentSelection.getRangeAt(0).getClientRects();
    assert.equal(
      didCaretMove(previousCaretPostion, newCaretPostion),
      false,
      " did the caret move"
    );
  });

  test("it removes element with no visible children", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("beer<div><span></span></div>bar");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    assert.equal(editor.innerHTML, "beer<div><span></span></div>bar"); //make sure this is not removed somehow
    const wordNode = editor.childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(wordNode, 4);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    const currentSelection = getWindowSelection();
    assert.equal(
      currentSelection.anchorNode?.parentElement?.innerText,
      "beerbar"
    );
    assert.equal(editor.innerHTML, "beerbar");
    const newCaretPostion = currentSelection.getRangeAt(0).getClientRects();
    assert.equal(
      didCaretMove(previousCaretPostion, newCaretPostion),
      false,
      "did the caret move"
    );
  });

  test("it removes and visibly empty element, when caret is inside", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent("beer<span></span>bar");
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    const spanNode = editor.childNodes[1];
    const selection = getWindowSelection();
    selection.collapse(spanNode, 0);
    assert.equal(editor.innerHTML, "beer<span></span>bar"); //make sure this is not removed somehow
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    const currentSelection = getWindowSelection();
    assert.equal(
      currentSelection.anchorNode?.parentElement?.innerText,
      "beerar"
    );
    assert.equal(editor.innerHTML, "beerar");
  });

  test("it removes a character of a far away in a nested div", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent('<div resource="zitting"></div>');
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    const divNode = editor.childNodes[0] as Element;
    divNode.appendChild(document.createTextNode("   "));
    divNode.insertAdjacentHTML(
      "beforeend",
      '<h1 resource="title">Notulen Van</h1>'
    );
    const selection = getWindowSelection();
    selection.collapse(divNode, 0);
    assert.equal(divNode.innerHTML, '   <h1 resource="title">Notulen Van</h1>'); //make sure this is not removed somehow
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    const resultString = `<h1 resource="title" data-editor-position-level="0" data-editor-rdfa-position-level="0">otulen Van</h1>`;
    assert.equal(divNode.innerHTML, resultString);
  });

  test("it removes a character as expected [Chromium edge case]", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        '<span property="persoon:gebruikteVoornaam"> Piet </span> Pluk'
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();
    const wordNode = editor.childNodes[0].childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(wordNode, 3);
    const previousCaretPostion = selection.getRangeAt(0).getClientRects();
    await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
    const currentSelection = getWindowSelection();
    assert.equal(currentSelection.anchorNode?.parentElement?.innerText, "Pit ");
    const newCaretPostion = currentSelection.getRangeAt(0).getClientRects();
    assert.equal(didCaretMove(previousCaretPostion, newCaretPostion), false);
  });

  /********************************************************************************
   * LISTS
   ********************************************************************************/

  test("Delete | Lists | delete in empty li results in ul with one less li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ul><li></li><li></li></ul>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    const firstItem = list.childNodes[0] as HTMLLIElement;
    const textNode = list.childNodes[0].childNodes[0];

    const selection = getWindowSelection()
    selection.collapse(firstItem, 0)

    await pressDelete();
    await wait(500)
    assert.equal(list.childElementCount, 1);
  });

  test("Delete | Lists | delete at end of nonempty li deletes the next empty li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ul><li>ab</li><li></li></ul>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    const firstItem = list.childNodes[0] as HTMLLIElement;
    const textNode = firstItem.childNodes[0];

    const selection = getWindowSelection();
    selection.collapse(textNode, 2);

    await pressDelete();
    assert.equal(list.childElementCount, 1);
    assert.equal(list.childNodes[0].textContent, "ab");
  });

  test("Delete | Lists | delete at end of non-empty <li> merges the next <li>", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ul><li>a</li><li>b</li></ul>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    const firstItem = list.children[0] as HTMLLIElement;
    const textNode = list.children[0].childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(textNode, 1);
    await pressDelete();
    assert.equal(list.children.length, 1);
    assert.equal(firstItem.innerText, "ab");
  });

  test("Delete | Lists | delete at end of empty li merges non-li text", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ul><li>a</li><li>b</li></ul><div>c</div>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    let lastItem = list.lastElementChild as HTMLLIElement;
    const textNode = lastItem.childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(textNode, 1);

    await pressDelete();
    lastItem = list.lastElementChild as HTMLLIElement;
    assert.equal(list.children.length, 2);
    assert.equal(lastItem.innerText, "bc");
  });

  test("Delete | Lists | delete at end of empty li deletes empty nodes and merges non-li text", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<ul><li>a</li><li>b</li></ul><div></div><div>c</div>`
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    const lastItem = list.lastElementChild as HTMLLIElement;
    const textNode = lastItem.childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(textNode, 1);

    await pressDelete();
    assert.equal(list.children.length, 2);
    assert.equal(lastItem.innerText, "bc");
  });

  test("Delete | Lists | delete at end of empty <li> merges next non-empty li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ul><li></li><li>b</li></ul>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    let firstItem = list.children[0] as HTMLLIElement;
    const textNode = list.children[0].childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(firstItem, 0);
    await pressDelete();
    firstItem = list.children[0] as HTMLLIElement;
    assert.equal(list.children.length, 1);
    assert.equal(firstItem.innerText, "b");
  });

  test("Delete | Lists | delete at end of empty <li> merges next non-li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ul><li></li></ul><div>bcd</div>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    let lastItem = list.lastElementChild as HTMLLIElement;

    const selection = getWindowSelection();
    selection.collapse(lastItem, 0);

    await pressDelete();

    assert.equal(list.children.length, 1);
    assert.equal(lastItem.innerText, "bcd");
  });

  test("Delete | Lists | delete before empty li deletes that li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<div>t</div><ul><li></li><li></li></ul><div>bcd</div>`
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const beforeList = editor.children[0] as HTMLDivElement;
    const list = editor.children[1] as HTMLUListElement;

    const selection = getWindowSelection();
    selection.collapse(beforeList.childNodes[0], 1);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
  });
  test("Delete | Lists | delete before nonempty li merges content and delets li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<div>a</div><ul><li>bcd</li><li></li></ul>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const beforeList = editor.children[0] as HTMLDivElement;
    const list = editor.children[1] as HTMLUListElement;

    const selection = getWindowSelection();
    selection.collapse(beforeList.childNodes[0], 1);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
    assert.equal(beforeList.textContent, "abcd");
  });
  test("Delete | Lists | delete in last li when next element is a list should merge lists", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<ul><li>bcd</li><li></li></ul><ul><li>efg</li></ul>`
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLDivElement;
    const lastLi = list.lastElementChild as HTMLLIElement;

    moveCaret(lastLi, 0);
    await pressDelete();

    assert.equal(list.childElementCount, 2);
    assert.equal(lastLi.textContent, "efg");
  });
  test("Delete | Lists | DBG delete in nested element should merge next li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<ul>
          <li>bcd<span>ef</span></li>
          <li>gh</li>
         </ul>`
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLDivElement;
    const firstLi = list.firstElementChild as HTMLLIElement;
    const selection = getWindowSelection();
    selection.collapse(firstLi.lastElementChild!.childNodes[0], 2);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
    assert.equal(firstLi.innerText, "bcdefgh");
  });

  test("DBG Delete | Lists | delete at last element should merge following textNode", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<ul><li></li></ul>abc`
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLDivElement;
    const firstLi = list.firstElementChild as HTMLLIElement;
    const selection = getWindowSelection();
    selection.collapse(firstLi, 0);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
    assert.equal(firstLi.textContent, "abc");

  })

  test("Delete | Lists | DBG delete in nested element should still delete normally when not at end of li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<ul>
          <li>bcd<span>ef</span><span>gh</span></li>
          <li></li>
         </ul>`
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLDivElement;
    const firstLi = list.firstElementChild as HTMLLIElement;
    const selection = getWindowSelection();
    selection.collapse(firstLi.childNodes[1].childNodes[0], 2);

    await pressDelete();

    assert.equal(list.childElementCount, 2);
    assert.equal(firstLi.textContent, "bcdefh");
  });
  test("Delete | Lists | ol delete in empty li results in ol with one less li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ol><li></li><li></li></ol>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    const firstItem = list.childNodes[0] as HTMLLIElement;
    const textNode = list.childNodes[0].childNodes[0];

    moveCaret(firstItem, 0);

    await pressDelete();
    assert.equal(list.childNodes.length, 1);
  });

  test("Delete | Lists | ol delete at end of nonempty li deletes the next empty li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ol><li>ab</li><li></li></ol>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    const firstItem = list.childNodes[0] as HTMLLIElement;
    const textNode = firstItem.childNodes[0];

    const selection = getWindowSelection();
    selection.collapse(textNode, 2);

    await pressDelete();
    assert.equal(list.childNodes.length, 1);
    assert.equal(list.childNodes[0].textContent, "ab");
  });

  test("Delete | Lists | ol delete at end of non-empty <li> merges the next <li>", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ol><li>a</li><li>b</li></ol>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    const firstItem = list.children[0] as HTMLLIElement;
    const textNode = list.children[0].childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(textNode, 1);
    await pressDelete();
    assert.equal(list.children.length, 1);
    assert.equal(firstItem.innerText, "ab");
  });

  test("Delete | Lists | ol delete at end of empty li merges non-li text", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ol><li>a</li><li>b</li></ol><div>c</div>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    const lastItem = list.lastElementChild as HTMLLIElement;
    const textNode = lastItem.childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(textNode, 1);

    await pressDelete();
    assert.equal(list.children.length, 2);
    assert.equal(lastItem.innerText, "bc");
  });

  test("Delete | Lists | ol delete at end of empty li deletes empty nodes and merges non-li text", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<ol><li>a</li><li>b</li></ol><div></div><div>c</div>`
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    const lastItem = list.lastElementChild as HTMLLIElement;
    const textNode = lastItem.childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(textNode, 1);

    await pressDelete();
    assert.equal(list.children.length, 2);
    assert.equal(lastItem.innerText, "bc");
  });

  test("Delete | Lists | ol delete at end of empty <li> merges next non-empty li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ol><li></li><li>b</li></ol>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    let firstItem = list.children[0] as HTMLLIElement;
    const textNode = list.children[0].childNodes[0];
    const selection = getWindowSelection();
    selection.collapse(firstItem, 0);
    await pressDelete();
    firstItem = list.children[0] as HTMLLIElement;
    assert.equal(list.children.length, 1);
    assert.equal(firstItem.innerText, "b");
  });

  test("Delete | Lists | ol delete at end of empty <li> merges next non-li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ol><li>a</li><li></li></ol><div>bcd</div>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLUListElement;
    let lastItem = list.lastElementChild as HTMLLIElement;

    const selection = getWindowSelection();
    selection.collapse(lastItem, 0);

    await pressDelete();

    lastItem = list.lastElementChild as HTMLLIElement;
    assert.equal(list.childElementCount, 2);
    assert.equal(lastItem.innerText, "bcd");
  });

  test("Delete | Lists | ol delete before empty li deletes that li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<div>t</div><ol><li></li><li></li></ol><div>bcd</div>`
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const beforeList = editor.children[0] as HTMLDivElement;
    const list = editor.children[1] as HTMLUListElement;

    const selection = getWindowSelection();
    selection.collapse(beforeList.childNodes[0], 1);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
  });
  test("Delete | Lists | ol delete before nonempty li merges content and delets li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<div>a</div><ol><li>bcd</li><li></li></ol>`);
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const beforeList = editor.children[0] as HTMLDivElement;
    const list = editor.children[1] as HTMLUListElement;

    const selection = getWindowSelection();
    selection.collapse(beforeList.childNodes[0], 1);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
    assert.equal(beforeList.textContent, "abcd");
  });
  test("Delete | Lists | ol delete in last li when next element is a list should merge lists", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<ol><li>bcd</li><li></li></ol><ol><li>efg</li></ol>`
      );
    });
    await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
    const editor = getEditorElement();

    const list = editor.children[0] as HTMLDivElement;
    const lastLi = list.lastElementChild as HTMLLIElement;

    moveCaret(lastLi, 0);
    await pressDelete();
    await wait(200);

    assert.equal(list.childElementCount, 2);
    assert.equal(lastLi.textContent, "efg");
  });
});

function pressDelete() {
  return triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
}
function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

//A simpele helper to have a more abstract way of defining wether caret moved
function didCaretMove(
  previousClientRects: DOMRectList,
  currentCLientRects: DOMRectList
) {
  if (!(previousClientRects.length && currentCLientRects.length)) {
    throw "We expected content in ClientRects";
  }
  if (previousClientRects.length !== currentCLientRects.length) {
    return true;
  } else {
    const { left: ol, top: ot } = previousClientRects[0];
    const { left: nl, top: nt } = currentCLientRects[0];
    const visibleChange = Math.abs(ol - nl) > 0.1 || Math.abs(ot - nt) > 0.1;

    return visibleChange;
  }
}
