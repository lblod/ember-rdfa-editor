declare namespace Cypress {
  interface Chainable {
    /**
     * Command to set the editor content from a fixture file.
     * @example cy.setEditorContentFromHtml('ordered-list.html')
     */
    setEditorContentFromHtml(value: string): Chainable;
  }
}
