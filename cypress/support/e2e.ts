import { addCompareSnapshotCommand } from 'cypress-visual-regression/dist/command';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import registerCypressGrep from '@cypress/grep/src/support';
import './commands';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
registerCypressGrep();
addCompareSnapshotCommand();

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

  cy.visit('/');
  cy.get('button').contains('Empty').click();

  cy.get('.say-editor__inner.say-content').as('editorContent');
});
