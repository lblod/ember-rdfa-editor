import type Owner from '@ember/owner';
import { render } from '@ember/test-helpers';
import {
  EditorState,
  SayController,
  type PluginConfig,
  type Schema,
} from '@lblod/ember-rdfa-editor';
import SayEditor from '@lblod/ember-rdfa-editor/core/say-editor';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

/**
 * Utility to get the editor element in a type-safe way
 * This avoids having to nullcheck everywhere where a null editor would be an error anyway.
 * @returns the editor element
 */
export function getEditorElement(): Element {
  const editor = document.querySelector('div[contenteditable]');
  if (!editor) throw new Error('Editor element not found in dom');
  return editor;
}

/**
 * Setup and render the editor
 * @returns A promise which renders the editor
 */
export async function renderEditor() {
  await render(hbs`
      <Editor
              @rdfaEditorInit={{this.rdfaEditorInit}}
              @profile="default"
              class="rdfa-playground"
              @editorOptions={{hash showToggleRdfaAnnotations="true" showInsertButton=null showRdfa="true"
                                    showRdfaHighlight="true" showRdfaHover="true"}}
              @toolbarOptions={{hash showTextStyleButtons="true" showListButtons="true" showIndentButtons="true"}}
      />`);
  return getEditorElement();
}

export function testEditor(
  schema: Schema,
  plugins: PluginConfig,
  initialState?: EditorState
): { editor: SayEditor; controller: SayController } {
  const mockOwner: Owner = {
    factoryFor: sinon.fake(),
    lookup: sinon.fake(),
    register: sinon.fake(),
  };
  const element = document.createElement('div');
  const editor = new SayEditor({
    owner: mockOwner,
    target: element,
    baseIRI: 'http://test.org',
    schema,
    plugins,
  });
  const controller = new SayController(editor);
  if (initialState) {
    editor.mainView.updateState(initialState);
  }
  return { editor, controller };
}
