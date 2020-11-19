import {
  triggerKeyEvent,
  render,
  findAll,
  waitUntil,
} from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import { MagicSpan } from "@lblod/ember-rdfa-editor/editor/input-handlers/delete-handler";

/**
 * Utility to get the editor element in a type-safe way
 * This avoids having to nullcheck everywhere where a null editor would be an error anyway.
 * @returns the editor element
 */
export function getEditorElement(): Element {
  const editor = document.querySelector("div[contenteditable]");
  if (!editor) throw new Error("Editor element not found in dom");
  return editor;
}

/**
 * Simulate a press of the delete key
 * TODO add better heuristics to wait for delete handler to finish
 * @returns a promise which simulates a delete keypress
 */
export async function pressDelete(timeout: number = 2000): Promise<void> {
  await triggerKeyEvent("div[contenteditable]", "keydown", "Delete");
  await waitUntil(() => findAll(`#${MagicSpan.ID}`).length === 0, {
    timeout,
  });
}

/**
 * Promise which waits for ms milliseconds
 * @param ms number of milliseconds to wait
 * @returns A Promise which waits for ms milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Setup and render the editor
 * @returns A promise which renders the editor
 */
export async function renderEditor() {
  await render(hbs`<Rdfa::RdfaEditor
      @rdfaEditorInit={{this.rdfaEditorInit}}
      @profile="default"
      class="rdfa-playground"
      @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true" showRdfaHighlight="true" showRdfaHover="true"}}
      @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
    />`);
  return getEditorElement();
}
