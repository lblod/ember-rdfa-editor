/**
 * Utility to get the editor element in a type-safe way
 * This avoids having to nullcheck everywhere where a null editor would be an error anyway.
 */
export function getEditorElement(): Element {
  const editor = document.querySelector("div[contenteditable]");
  if (!editor) throw new Error("Editor element not found in dom");
  return editor;
}
