import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import RdfaDocument from "@lblod/ember-rdfa-editor/utils/rdfa/rdfa-document";
import {
  getWindowSelection,
  tagName,
} from "@lblod/ember-rdfa-editor/utils/dom-helpers";
import {
  moveCaret,
  hasVisibleChildren,
  moveCaretToEndOfNode,
} from "@lblod/ember-rdfa-editor/editor/utils";
import { pressDelete, wait, renderEditor } from "dummy/tests/test-utils";
import {
  LUMP_NODE_URI,
  hasLumpNodeProperty,
} from "@lblod/ember-rdfa-editor/utils/ce/lump-node-utils";
import { click } from "@ember/test-helpers";

function lump(innerHTML: string) {
  return `<div property="${LUMP_NODE_URI}" style="background-color:green">${innerHTML}</div>`;
}

module(
  "Integration | InputHandler | lump-node-delete-plugin",
  function (hooks) {
    setupRenderingTest(hooks);
    test("Delete | Lumpnodes | single delete in front of lumpnode does not delete it", async function (assert) {
      const initial = `baz${lump(`bar`)}foo`;
      this.set("rdfaEditorInit", (editor: RdfaDocument) => {
        editor.setHtmlContent(initial);
      });
      const editor = await renderEditor();

      moveCaretToEndOfNode(editor.firstChild!);

      await pressDelete();

      assert.equal(editor.childElementCount, 1);
      assert.equal(tagName(editor.firstElementChild), "div");
      assert.ok(hasLumpNodeProperty(editor.firstElementChild!));
    });

    test("Delete | Lumpnodes | double delete in front of lumpnode does delete it", async function (assert) {
      const initial = `baz${lump(`bar`)}foo`;
      this.set("rdfaEditorInit", (editor: RdfaDocument) => {
        editor.setHtmlContent(initial);
      });
      const editor = await renderEditor();

      const textNode = editor.childNodes[0];
      const selection = getWindowSelection();
      selection.collapse(textNode, 3);
      await click('div[contenteditable]');

      await wait(500);
      await pressDelete();
      await wait(500);
      await pressDelete();
      await wait(500);

      assert.equal(editor.childElementCount, 0);
    });

    test("Delete | Lumpnodes | single delete inside of lumpnode does not delete it", async function (assert) {
      const initial = `baz${lump(`bar`)}foo`;
      this.set("rdfaEditorInit", (editor: RdfaDocument) => {
        editor.setHtmlContent(initial);
      });
      const editor = await renderEditor();
      const lumpNode = editor.firstElementChild!;
      const textNode = lumpNode.firstChild;
      const selection = getWindowSelection();
      selection.collapse(textNode, 1);

      await pressDelete();


      assert.equal(editor.childElementCount, 1);
      assert.equal(tagName(editor.firstElementChild), "div");
      assert.ok(lumpNode.isConnected);
      assert.ok(hasLumpNodeProperty(editor.firstElementChild!));
    });
  }
);
