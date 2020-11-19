import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import RdfaDocument from "@lblod/ember-rdfa-editor/utils/rdfa/rdfa-document";
import { getWindowSelection } from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {
  moveCaret,
  hasVisibleChildren,
} from "@lblod/ember-rdfa-editor/editor/utils";
import { pressDelete, wait, renderEditor } from "dummy/tests/test-utils";
module("Integration | InputHandler | list-delete-plugin", function (hooks) {
  setupRenderingTest(hooks);
  test("Delete | Lists | delete in empty li at end of document does nothing", async function (assert) {
    const initial = `<ul><li></li></ul>`;
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(initial);
    });
    const editor = await renderEditor();
    const selection = getWindowSelection();

    const list = editor.children[0];
    const li = list.children[0];
    selection.collapse(li, 0);
    await pressDelete();

    assert.equal(editor.childElementCount, 1);
    assert.equal(list.childElementCount, 1);
    assert.equal(selection.anchorNode?.parentElement, li);
  });

  test("Delete | Lists | delete before ul with single empty li deletes ul", async function (assert) {
    const initial = `<ul><li></li></ul>`;
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(initial);
    });
    const editor = await renderEditor();
    const selection = getWindowSelection();

    const list = editor.children[0];
    selection.collapse(editor, 0);
    await pressDelete();
    await wait(3000);

    assert.equal(editor.childElementCount, 0);
    assert.dom(".say-content > ul").doesNotExist();
  });

  test("Delete | Lists | delete in li removes character", async function (assert) {
    const initial = `<ul><li>a</li></ul>`;
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(initial);
    });
    const editor = await renderEditor();
    const selection = getWindowSelection();

    const list = editor.childNodes[0] as Element;
    const li = list.childNodes[0] as Element;
    const liTextNode = li.childNodes[0];

    selection.collapse(liTextNode, 0);
    await pressDelete();

    assert.equal(editor.childNodes.length, 1);
    assert.equal(list.childNodes.length, 1);
    assert.notOk(hasVisibleChildren(li));
    assert.ok(li.childNodes.length <= 1);
  });

  test("Delete | Lists | delete at end of last li does nothing", async function (assert) {
    const initial = `<ul><li>a</li></ul>`;
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(initial);
    });
    const editor = await renderEditor();
    const selection = getWindowSelection();

    const list = editor.childNodes[0] as HTMLElement;
    const li = list.childNodes[0] as HTMLElement;
    const liTextNode = li.childNodes[0];

    selection.collapse(liTextNode, 1);
    await pressDelete();

    assert.equal(editor.childNodes.length, 1);
    assert.equal(list.childNodes.length, 1);
    assert.ok(hasVisibleChildren(li));
    assert.ok(li.childNodes.length >= 1);
    assert.equal(li.innerText, "a");
  });

  test("Delete | Lists | delete before nonempty li merges content and deletes li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<div>a</div><ul><li>bcd</li><li></li></ul>`);
    });
    const editor = await renderEditor();

    const beforeList = editor.children[0] as HTMLDivElement;
    const list = editor.children[1] as HTMLUListElement;

    const selection = getWindowSelection();
    selection.collapse(beforeList.childNodes[0], 1);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
    assert.equal(beforeList.textContent, "abcd");
  });
  test("Delete | Lists | delete before nonempty li merges nested content and delets li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<div>a</div><ul><li>bc<b>d</b></li><li></li></ul>`);
    });
    const editor = await renderEditor();

    const beforeList = editor.children[0] as HTMLDivElement;
    const list = editor.children[1] as HTMLUListElement;

    const selection = getWindowSelection();
    selection.collapse(beforeList.childNodes[0], 1);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
    assert.equal(beforeList.textContent, "abcd");
  });

  test("Delete | Lists | delete in empty li results in ul with one less li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ul><li></li><li></li></ul>`);
    });
    const editor = await renderEditor();

    const list = editor.children[0] as HTMLUListElement;
    const firstItem = list.childNodes[0] as HTMLLIElement;

    const selection = getWindowSelection();
    selection.collapse(firstItem, 0);

    await pressDelete();
    await wait(500);
    assert.equal(list.childElementCount, 1);
  });

  test("Delete | Lists | delete at end of nonempty li deletes the next empty li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ul><li>ab</li><li></li></ul>`);
    });
    const editor = await renderEditor();

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
    const editor = await renderEditor();

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
    const editor = await renderEditor();

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
    const editor = await renderEditor();

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
    const editor = await renderEditor();

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
    const editor = await renderEditor();

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
    const editor = await renderEditor();

    const beforeList = editor.children[0] as HTMLDivElement;
    const list = editor.children[1] as HTMLUListElement;

    const selection = getWindowSelection();
    selection.collapse(beforeList.childNodes[0], 1);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
  });
  test("Delete | Lists | delete in last li when next element is a list should merge lists", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<ul><li>bcd</li><li></li></ul><ul><li>efg</li></ul>`
      );
    });
    const editor = await renderEditor();

    const list = editor.children[0] as HTMLDivElement;
    const lastLi = list.lastElementChild as HTMLLIElement;

    moveCaret(lastLi, 0);
    await pressDelete();

    assert.equal(list.childElementCount, 2);
    assert.equal(lastLi.textContent, "efg");
  });
  test("Delete | Lists | delete in nested element should merge next li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<ul>
          <li>bcd<span>ef</span></li>
          <li>gh</li>
         </ul>`
      );
    });
    const editor = await renderEditor();

    const list = editor.children[0] as HTMLDivElement;
    const firstLi = list.firstElementChild as HTMLLIElement;
    const selection = getWindowSelection();
    selection.collapse(firstLi.lastElementChild!.childNodes[0], 2);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
    assert.equal(firstLi.innerText, "bcdefgh");
  });

  test("Delete | Lists | delete at last element should merge following textNode", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ul><li></li></ul>abc`);
    });
    const editor = await renderEditor();

    const list = editor.children[0] as HTMLDivElement;
    const firstLi = list.firstElementChild as HTMLLIElement;
    const selection = getWindowSelection();
    selection.collapse(firstLi, 0);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
    assert.equal(firstLi.textContent, "abc");
  });

  test("Delete | Lists | delete in nested element should still delete normally when not at end of li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<ul>
          <li>bcd<span>ef</span><span>gh</span></li>
          <li></li>
         </ul>`
      );
    });
    const editor = await renderEditor();

    const list = editor.children[0] as HTMLDivElement;
    const firstLi = list.firstElementChild as HTMLLIElement;
    const selection = getWindowSelection();
    selection.collapse(firstLi.childNodes[1].childNodes[0], 2);

    await pressDelete();

    assert.equal(list.childElementCount, 2);
    assert.equal(firstLi.textContent, "bcdefh");
  });
  test("Delete | Lists | delete should delete empty textnode and next character", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<ul>
          <li></li>
         </ul>`
      );
    });
    const editor = await renderEditor();

    const list = editor.children[0] as HTMLDivElement;
    const firstLi = list.firstElementChild as HTMLLIElement;
    const emptyTextNode = document.createTextNode("");
    const filledTextNode = document.createTextNode("abc");

    firstLi.appendChild(emptyTextNode);
    firstLi.appendChild(filledTextNode);

    const selection = getWindowSelection();
    selection.collapse(emptyTextNode, 0);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
    assert.equal(firstLi.textContent, "bc");
  });
  test("Delete | Lists | delete should delete empty textnode and merge next element's content", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(
        `<ul>
          <li></li>
          <li>abc</li>
         </ul>`
      );
    });
    const editor = await renderEditor();

    const list = editor.children[0] as HTMLDivElement;
    const firstLi = list.firstElementChild as HTMLLIElement;
    const emptyTextNode = document.createTextNode("");

    firstLi.appendChild(emptyTextNode);

    const selection = getWindowSelection();
    selection.collapse(emptyTextNode, 0);

    await pressDelete();

    assert.equal(list.childElementCount, 1);
    assert.equal(firstLi.textContent, "abc");
  });
  test("Delete | Lists | delete before list should delete list", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<div>a</div><ul><li></li></ul><div>b</div>`);
    });
    const editor = await renderEditor();

    const beforeList = editor.children[0] as HTMLDivElement;
    const list = editor.children[1] as HTMLUListElement;
    const firstLi = list.firstElementChild as HTMLLIElement;

    const selection = getWindowSelection();
    selection.collapse(beforeList.childNodes[0], 1);

    await pressDelete();

    assert.equal(editor.childElementCount, 2);
    assert.equal(list.parentElement, null);
  });
  test("Delete | Lists | ol delete in empty li results in ol with one less li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ol><li></li><li></li></ol>`);
    });
    const editor = await renderEditor();

    const list = editor.children[0] as HTMLUListElement;
    const firstItem = list.childNodes[0] as HTMLLIElement;

    const selection = getWindowSelection();
    selection.collapse(firstItem, 0);

    await pressDelete();
    assert.equal(list.childElementCount, 1);
  });

  test("Delete | Lists | ol delete at end of nonempty li deletes the next empty li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ol><li>ab</li><li></li></ol>`);
    });
    const editor = await renderEditor();

    const list = editor.children[0] as HTMLUListElement;
    const firstItem = list.childNodes[0] as HTMLLIElement;
    const textNode = firstItem.childNodes[0];

    const selection = getWindowSelection();
    selection.collapse(textNode, 2);

    await pressDelete();
    assert.equal(list.childElementCount, 1);
    assert.equal(list.childNodes[0].textContent, "ab");
  });
  test("Delete | Lists | ol delete at end of nonempty li before empty textnode deletes the next empty li", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`
<ol>
<li>ab</li>
<li></li>
</ol>
`);
    });
    debugger;
    const editor = await renderEditor();

    const list = editor.children[0] as HTMLUListElement;
    const firstItem = list.children[0] as HTMLLIElement;
    const textNode = firstItem.childNodes[0];

    const selection = getWindowSelection();
    selection.collapse(textNode, 2);

    await pressDelete();
    await wait(3000)
    assert.equal(list.childElementCount, 1);
    assert.equal(list.children[0].textContent, "ab");
  });

  test("Delete | Lists | ol delete at end of non-empty <li> merges the next <li>", async function (assert) {
    this.set("rdfaEditorInit", (editor: RdfaDocument) => {
      editor.setHtmlContent(`<ol><li>a</li><li>b</li></ol>`);
    });
    const editor = await renderEditor();

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
    const editor = await renderEditor();

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
    const editor = await renderEditor();

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
    const editor = await renderEditor();

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
    const editor = await renderEditor();

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
    const editor = await renderEditor();

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
    const editor = await renderEditor();

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
    const editor = await renderEditor();

    const list = editor.children[0] as HTMLDivElement;
    const lastLi = list.lastElementChild as HTMLLIElement;

    moveCaret(lastLi, 0);
    await pressDelete();
    await wait(200);

    assert.equal(list.childElementCount, 2);
    assert.equal(lastLi.textContent, "efg");
  });
});
