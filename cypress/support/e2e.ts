import './commands';

beforeEach(() => {
  cy.viewport(1280, 720);
  cy.on('window:before:load', (win) => {
    Object.defineProperty(win.navigator, 'languages', {
      get: cy.stub().returns(['en-US']),
    });
    Object.defineProperty(win.navigator, 'language', {
      get: cy.stub().returns('en-US'),
    });
  });

  cy.visit('http://localhost:4200');
  cy.get('button').contains('Empty').click();

  cy.get('.say-editor__inner.say-content').as('editorContent');
});
