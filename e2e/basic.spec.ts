import { test, expect } from '@playwright/test';
import { EditorPage } from 'models/editor';

test.describe('basic editor functionality', () => {
  test('passes', async ({ page }) => {
    const editorPage = new EditorPage(page);

    await editorPage.goto();
    await editorPage.fillEditor('this is a test');

    const content = await editorPage.editorContainer.locator('p').textContent();
    expect(content).toContain('this is a test');
  });
});
