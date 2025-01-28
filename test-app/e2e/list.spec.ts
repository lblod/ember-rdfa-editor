import { test } from '@playwright/test';
import { EditorPage } from 'models/editor';

test.describe('lists', () => {
  test('checks that ordered lists are rendered correctly @vrt', async ({
    page,
  }) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto();
    await editorPage.setEditorContentAndCompareSnapshot(
      'ordered-list',
      'ordered-list',
    );
  });

  test('checks that unordered lists are rendered correctly @vrt', async ({
    page,
  }) => {
    const editorPage = new EditorPage(page);
    await editorPage.goto();
    await editorPage.setEditorContentAndCompareSnapshot(
      'unordered-list',
      'unordered-list',
    );
  });
});
