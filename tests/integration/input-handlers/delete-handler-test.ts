import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import {
  render,
  triggerKeyEvent,
} from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import RdfaDocument from "@lblod/ember-rdfa-editor/utils/rdfa/rdfa-document";
import { getWindowSelection } from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import { getEditorElement, wait } from "dummy/tests/test-utils";

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

  test("DBG it removes and visibly empty element, when caret is inside", async function (assert) {
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
    await wait(100);
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

});


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
