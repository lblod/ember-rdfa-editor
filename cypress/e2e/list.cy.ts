describe('lists', { tags: '@vrt' }, () => {
  it('checks that unordered lists are rendered correctly', () => {
    cy.setEditorContentFromHtml('unordered-list.html')
      .get('@editorContent')
      .compareSnapshot('unordered-list');
  });

  it('checks that ordered lists are rendered correctly', () => {
    cy.setEditorContentFromHtml('ordered-list.html')
      .get('@editorContent')
      .compareSnapshot('ordered-list');
  });
});
