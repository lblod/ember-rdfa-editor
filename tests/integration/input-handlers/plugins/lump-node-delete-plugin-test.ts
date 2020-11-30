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
      assert.ok(hasLumpNodeProperty(editor.firstElementChild));
    });

    test("Delete | Lumpnodes | double delete in front of lumpnode does delete it", async function (assert) {
      const initial = `baz${lump(`bar`)}foo`;
      this.set("rdfaEditorInit", (editor: RdfaDocument) => {
        editor.setHtmlContent(initial);
      });
      const editor = await renderEditor();

      moveCaretToEndOfNode(editor.firstChild!);

      await pressDelete();

      assert.equal(editor.childElementCount, 0);
    });
  }
);
