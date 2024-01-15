describe('basic editor functionality', () => {
  it('passes', () => {
    cy.get('@editorContent').type('this is a test');

    cy.get('.say-editor__inner.say-content')
      .children('p')
      .contains('this is a test');
  });
});
